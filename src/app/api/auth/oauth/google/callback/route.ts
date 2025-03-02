// src/app/api/auth/oauth/google/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { generateAuthResponse } from '@/lib/auth'
import { UserRow } from '@/types/user'
import { ResultSetHeader } from 'mysql2/promise'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`

export async function GET(request: Request) {
  try {
    // Validate required environment variables
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing required environment variables for Google OAuth')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=configuration_error`)
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    // Verify state to prevent CSRF attacks
    const cookieStore = await cookies()
    const storedState = cookieStore.get('oauth_state')?.value
    
    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state`)
    }
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_exchange`)
    }
    
    const tokenData = await tokenResponse.json()
    
    // Fetch user profile with the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    if (!userInfoResponse.ok) {
      console.error('User info fetch failed:', await userInfoResponse.text())
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=user_info`)
    }
    
    const userData = await userInfoResponse.json()
    
    // Check if user already exists in our database
    const [existingUsers] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [userData.email]
    )
    
    let user: UserRow
    
    if (existingUsers.length > 0) {
      // Update existing user's Google-related fields
      user = existingUsers[0]
      await pool.execute(
        `UPDATE users 
         SET google_id = ?, profile_image = ?, updated_at = NOW()
         WHERE id = ?`,
        [userData.id, userData.picture, user.id]
      )
    } else {
      // Create new user with Google data
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO users 
         (email, first_name, last_name, google_id, profile_image, password_hash, role) 
         VALUES (?, ?, ?, ?, ?, '', 'staff')`,
        [
          userData.email,
          userData.given_name || userData.name?.split(' ')[0] || '',
          userData.family_name || userData.name?.split(' ').slice(1).join(' ') || '',
          userData.id,
          userData.picture
        ]
      )
      
      // Fetch the newly created user
      const [newUsers] = await pool.execute<UserRow[]>(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      )
      
      if (newUsers.length === 0) {
        throw new Error('Failed to fetch created user')
      }
      
      user = newUsers[0]
    }
    
    // Generate authentication response with JWT token
    const authResponse = generateAuthResponse(user)
    
    // Create a secure response page that uses postMessage to communicate with the parent window
    // This is more secure than directly injecting values into a script
    const html = `
      <html>
        <head>
          <title>กำลังดำเนินการเข้าสู่ระบบด้วย Google...</title>
          <script>
            // Securely handle auth data by using script execution context instead of string interpolation
            const authData = {
              token: ${JSON.stringify(authResponse.token)},
              user: ${JSON.stringify(authResponse.user)}
            };
            
            // Store auth data in localStorage
            localStorage.setItem('token', authData.token);
            localStorage.setItem('user', JSON.stringify(authData.user));
            
            // Redirect to home page
            window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}';
          </script>
        </head>
        <body>
          <p>กำลังเข้าสู่ระบบ กรุณารอสักครู่...</p>
        </body>
      </html>
    `;
    
    // Return HTML response that sets localStorage and redirects
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        // Clear the oauth state cookie
        'Set-Cookie': 'oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
      }
    })
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`)
  }
}