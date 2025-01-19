// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { z } from 'zod'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'technician' | 'staff';
  phone: string | null;
}

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  firstName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  lastName: z.string().min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'),
  role: z.enum(['admin', 'technician', 'staff']),
  phone: z.string().min(10, 'เบอร์โทรไม่ถูกต้อง').optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const [existingUsers] = await pool.execute<UserRow[]>(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    )
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.email, hashedPassword, data.firstName, data.lastName, data.role, data.phone]
    )

    if (result.affectedRows !== 1) {
      throw new Error('Failed to insert user')
    }

    return NextResponse.json({ 
      message: 'สมัครสมาชิกสำเร็จ',
      userId: result.insertId
    })

  } catch (error) {
    console.error('Register error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    )
  }
}