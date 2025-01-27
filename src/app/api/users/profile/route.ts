// src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'
import { UserRow } from '@/types/user'

const updateProfileSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('profile'),
    firstName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
    lastName: z.string().min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'),
    phone: z.string().min(10, 'เบอร์โทรไม่ถูกต้อง').nullish(),
  }),
  z.object({
    type: z.literal('password'),
    currentPassword: z.string().min(1, 'กรุณาระบุรหัสผ่านปัจจุบัน'),
    newPassword: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  })
]);

export async function PUT(req: NextRequest) {
  try {
    const userId = await verifyAuth(req)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    // Get current user
    const [users] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )
   
    const user = users[0]
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (data.type === 'password') {
      // Check current password if trying to change password
      const validPassword = await bcrypt.compare(data.currentPassword, user.password_hash)
      if (!validPassword) {
        return NextResponse.json(
          { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' },
          { status: 400 }
        )
      }

      // Update password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10)
      await pool.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, userId]
      )
    } else {
      // Update profile
      await pool.execute(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
        [data.firstName, data.lastName, data.phone, userId]
      )
    }

    // Fetch updated user
    const [updatedUsers] = await pool.execute<UserRow[]>(
      'SELECT id, email, first_name, last_name, role, phone FROM users WHERE id = ?',
      [userId]
    )

    const updatedUser = updatedUsers[0]
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      phone: updatedUser.phone
    })

  } catch (error) {
    console.error('Update profile error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' },
      { status: 500 }
    )
  }
}
