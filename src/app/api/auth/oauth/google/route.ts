// src/app/api/auth/oauth/google/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`

// Scopes we're requesting from Google
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

export async function GET() {
  // Validate required environment variables
  if (!GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_APP_URL) {
    console.error('Missing required environment variables for Google OAuth')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=configuration_error`)
  }

  // Generate a random state parameter to protect against CSRF attacks
  const state = Math.random().toString(36).substring(2, 15)

  // Store state in a secure HTTP-only cookie
  const cookieHeader = `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`
  
  // Build the authorization URL for Google OAuth
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI)
  googleAuthUrl.searchParams.append('response_type', 'code')
  googleAuthUrl.searchParams.append('scope', SCOPES)
  googleAuthUrl.searchParams.append('state', state)
  googleAuthUrl.searchParams.append('access_type', 'offline')
  googleAuthUrl.searchParams.append('prompt', 'consent')
  
  // Redirect to Google's authorization server
  return NextResponse.redirect(googleAuthUrl.toString(), {
    headers: {
      'Set-Cookie': cookieHeader
    }
  })
}
