// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { generateAuthResponse } from '@/lib/auth'
import { UserRow } from '@/types/user'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const [users] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [body.email]
    )
    
    const user = users[0]
    
    if (!user) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const validPassword = await bcrypt.compare(body.password, user.password_hash)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const authResponse = generateAuthResponse(user)
    return NextResponse.json(authResponse)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    )
  }
}