"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, KeyRound, Eye, EyeOff, Loader2, AlertCircle, User, Phone } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'

interface UserData {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'technician' | 'staff'
  phone: string | null
}

interface AuthResponse {
  token: string
  user: UserData
  message?: string
}

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  firstName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  lastName: z.string().min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'),
  phone: z.string().min(10, 'เบอร์โทรไม่ถูกต้อง')
})

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  isDark?: boolean
  onSuccess: (response: AuthResponse) => void
}

export const RegisterModal = ({ isOpen, onClose, onSuccess, isDark = true }: RegisterModalProps) => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate form data
      registerSchema.parse(formData)

      const response = await axios.post<AuthResponse>('/api/auth/register', formData)
      
      if (response.data) {
        onSuccess(response.data)
        onClose()
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>
        setError(axiosError.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      } else if (error instanceof Error) {
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
                <h2 className="text-2xl font-bold mb-2">สมัครสมาชิก</h2>
                <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
                  กรุณากรอกข้อมูลเพื่อสมัครสมาชิก
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>
                      ชื่อ
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all ${
                          isDark ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="ชื่อ"
                        required
                      />
                      <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>
                      นามสกุล
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all ${
                          isDark ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="นามสกุล"
                        required
                      />
                      <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </div>

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
                      placeholder="อีเมล"
                      required
                    />
                    <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all ${
                        isDark ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      placeholder="เบอร์โทรศัพท์"
                      required
                    />
                    <Phone size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-400' : 'text-gray-400'}`} />
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
                      placeholder="รหัสผ่าน"
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
                    'สมัครสมาชิก'
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

export default RegisterModal