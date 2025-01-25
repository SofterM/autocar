// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import { UserRow, UserResponse } from '@/types/user'
import { NextRequest } from 'next/server'

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export async function verifyAuth(req: NextRequest): Promise<number | null> {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return null
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload
    return decoded.userId
  } catch (error) {
    return null
  }
}

export function generateAuthResponse(user: UserRow): AuthResponse {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone
    }
  }
}