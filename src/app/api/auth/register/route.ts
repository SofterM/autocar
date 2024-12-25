// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  firstName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  lastName: z.string().min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'),
  phone: z.string().min(10, 'เบอร์โทรไม่ถูกต้อง'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    )
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    await pool.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [data.email, hashedPassword, data.firstName, data.lastName, data.phone]
    )

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ' })

  } catch {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    )
  }
}
