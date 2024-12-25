// src/app/register/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      router.push('/login?registered=true')
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
        <h2 className="text-2xl font-bold text-white mb-6 text-center">สมัครสมาชิก</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-gray-300 text-sm">ชื่อ</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-[#1A1B2E] text-white border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#6C63FF]"
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-gray-300 text-sm">นามสกุล</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-[#1A1B2E] text-white border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#6C63FF]"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm">อีเมล</label>
              <div className="relative">
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
              <div className="relative">
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

            <div>
              <label className="text-gray-300 text-sm">เบอร์โทรศัพท์</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-[#1A1B2E] text-white border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#6C63FF]"
                  required
                />
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6C63FF] to-[#5B53FF] text-white py-2 rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
