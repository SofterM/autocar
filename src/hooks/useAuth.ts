// src/hooks/useAuth.ts
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // เก็บ token และข้อมูลผู้ใช้
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // เปลี่ยนเส้นทาง
        router.push('/appointments')
        return true
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        return false
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { login, logout, error }
}