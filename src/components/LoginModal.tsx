// src/components/LoginModal.tsx
"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, KeyRound, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  isDark?: boolean
}

export const LoginModal = ({ isOpen, onClose, isDark = true }: LoginModalProps) => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/login', formData)
      const { token, user } = response.data
      
      // บันทึก token ลง localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      onClose()
      window.location.reload()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${
              isDark ? 'bg-stone-900/95 text-stone-100' : 'bg-white/95 text-gray-900'
            }`}
          >
            <button
              onClick={onClose}
              className={`absolute right-4 top-4 p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">เข้าสู่ระบบ</h2>
                <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
                  กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'
                  }`}
                >
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-red-500 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>
                    อีเมล
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all ${
                        isDark ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      placeholder="กรอกอีเมลของคุณ"
                      required
                    />
                    <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all ${
                        isDark ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      required
                    />
                    <KeyRound size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-gray-400'}`} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400 hover:text-stone-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-[#6C63FF] hover:bg-[#5B53FF] text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LoginModal
