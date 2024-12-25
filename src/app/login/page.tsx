// src/app/login/page.tsx
'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'
import Link from 'next/link'

// แยก component สำหรับส่วนที่ใช้ useSearchParams
function RegisteredMessage() {
  const searchParams = useSearchParams()
  if (!searchParams.get('registered')) return null
  
  return (
    <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded mb-4">
      สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
    </div>
  )
}

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      router.push('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1B2E]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1B2E]/50 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-800"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">เข้าสู่ระบบ</h2>
        
        <Suspense fallback={null}>
          <RegisteredMessage />
        </Suspense>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-300 text-sm">อีเมล</label>
            <div className="relative mt-1">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#1A1B2E] text-white border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#6C63FF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm">รหัสผ่าน</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#1A1B2E] text-white border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#6C63FF]"
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6C63FF] to-[#5B53FF] text-white py-3 rounded-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaSignInAlt className="text-sm" />
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </motion.button>

          <div className="text-center text-gray-400">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register">
              <span className="text-[#6C63FF] hover:text-[#5B53FF] cursor-pointer">
                สมัครสมาชิก
              </span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
