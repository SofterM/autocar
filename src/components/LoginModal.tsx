// D:\Github\autocar\src\components\LoginModal.tsx
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
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogleLogin = () => {
    try {
      setGoogleLoading(true)
      setError(null)
      
      // Redirect to Clerk's Google OAuth sign-in
      window.location.href = '/api/auth/oauth/google'
    } catch (err) {
      console.error("Google auth error:", err)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google กรุณาลองใหม่อีกครั้ง')
      setGoogleLoading(false)
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
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${isDark ? 'border-stone-700' : 'border-gray-200'}`}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 ${isDark ? 'bg-stone-900 text-stone-400' : 'bg-white text-gray-500'}`}>
                      หรือเข้าสู่ระบบด้วย
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className={`mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium border transition-all duration-200 ${
                    isDark
                      ? 'border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {googleLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                      </svg>
                      <span>เข้าสู่ระบบด้วย Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LoginModal