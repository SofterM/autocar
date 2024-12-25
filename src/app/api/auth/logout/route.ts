// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    response.cookies.delete('token')
    response.cookies.delete('user')

    return response
  } catch {
    return NextResponse.json(
      { error: 'Error logging out' },
      { status: 500 }
    )
  }
}
