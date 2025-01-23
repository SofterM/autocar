// src/app/api/auth/check-admin/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import pool from '@/lib/db'
import { UserRow } from '@/types/user'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    const [users] = await pool.execute<UserRow[]>(
      'SELECT id, role FROM users WHERE id = ?',
      [decoded.userId]
    )

    const user = users[0]
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      isAllowed: ['admin', 'technician'].includes(user.role)
    })

  } catch (error) {
    console.error('Check admin error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', success: false },
      { status: 401 }
    )
  }
}