'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import StarryBackground from '@/components/StarryBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import debounce from 'lodash/debounce'

const TEXTS = [
  'ระบบซ่อมบำรุงยานพาหนะ',
  'ระบบติดตามการซ่อม',
  'ระบบแจ้งเตือนการบำรุง',
  'ระบบจัดการอะไหล่'
]

interface Repair {
  id: string
  brand: string
  model: string
  license_plate: string
  color: string
  customer: {
    name: string
    phone: string
    email: string
  }
  start_date: string
  expected_end_date: string | null
  actual_end_date: string | null
  status: string
  category: string
  estimated_cost: number
  final_cost: number | null
  mileage: number
  description: string
}

export default function Home() {
  const [currentIndex, setIndex] = useState(0)
  const [currentText, setCurrentText] = useState(TEXTS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % TEXTS.length
        setCurrentText(TEXTS[newIndex])
        return newIndex
      })
    }, 3000)
    return () => clearInterval(intervalId)
  }, [])

  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setRepairs([])
      return
    }

    setIsSearching(true)
    setError('')
    try {
      const searchParams = new URLSearchParams({ search: query })
      const response = await fetch(`/api/repairs?${searchParams.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch repairs')
      const data = await response.json()
      setRepairs(data)
    } catch (error) {
      console.error('Search error:', error)
      setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่')
    } finally {
      setIsSearching(false)
    }
  }, 300)

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery])

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: 'เสร็จสิ้น',
      in_progress: 'กำลังซ่อม', 
      pending: 'รอดำเนินการ',
      cancelled: 'ยกเลิก'
    }
    return statusMap[status] || status
  }

  const getStatusStyle = (status: string) => {
    const styleMap: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styleMap[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '-'
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StarryBackground />
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        <Navbar />
        <main className="min-h-screen pb-32">
          <div className="flex flex-col items-center justify-center px-4 sm:px-6 pt-20">
            <motion.div
              className="text-center max-w-4xl z-10 w-full relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                ระบบจัดการคุณภาพ
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentText}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden h-12 sm:h-16 lg:h-24"
                  >
                    <span className="block mt-2 text-[#6C63FF] text-4xl sm:text-5xl lg:text-7xl font-extrabold">
                      {currentText}
                    </span>
                  </motion.div>
                </AnimatePresence>
                และบริการ
              </h1>
              
              <motion.p
                className="text-gray-400 text-sm sm:text-base lg:text-xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ยกระดับการบริหารจัดการยานพาหนะด้วยระบบอัตโนมัติ
              </motion.p>

              <motion.div
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/20 to-blue-500/20 rounded-xl blur"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 transition-all group-hover:border-[#6C63FF]/50">
                    <div className="flex items-center px-4">
                      <Search className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาด้วยเลขทะเบียน, ชื่อลูกค้า..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-8 flex justify-center"
                    >
                      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-md">
                        <svg className="animate-spin h-5 w-5 text-[#6C63FF]" viewBox="0 0 24 24">
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                            fill="none"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="text-gray-400 font-medium">กำลังค้นหา...</span>
                      </div>
                    </motion.div>
                  ) : repairs.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 space-y-4 max-h-[calc(100vh-500px)] overflow-auto custom-scrollbar"
                    >
                      {repairs.map((repair) => (
                        <motion.div
                          key={repair.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-[#6C63FF]/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-white text-lg">
                                {repair.brand} {repair.model}
                              </h3>
                              <p className="text-sm text-gray-400">
                                ทะเบียน: {repair.license_plate}
                                {repair.color && ` • สี${repair.color}`}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(repair.status)}`}>
                              {getStatusText(repair.status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">ลูกค้า: <span className="text-white">{repair.customer.name}</span></p>
                              <p className="text-gray-400">โทร: <span className="text-white">{formatPhoneNumber(repair.customer.phone)}</span></p>
                            </div>
                            <div>
                              <p className="text-gray-400">วันรับรถ: <span className="text-white">{formatDate(repair.start_date)}</span></p>
                              <p className="text-gray-400">นัดรับรถ: <span className="text-white">{formatDate(repair.expected_end_date)}</span></p>
                            </div>
                            <div>
                              <p className="text-gray-400">เลขไมล์: <span className="text-white">{repair.mileage.toLocaleString()} กม.</span></p>
                              <p className="text-gray-400">ประเมินราคา: <span className="text-white">฿{repair.estimated_cost.toLocaleString()}</span></p>
                              {repair.final_cost !== null && (
                                <p className="text-gray-400">ค่าซ่อมจริง: <span className="text-white">฿{repair.final_cost.toLocaleString()}</span></p>
                              )}
                            </div>
                            {repair.description && (
                              <div className="sm:col-span-2">
                                <p className="text-gray-400">รายละเอียด: <span className="text-white">{repair.description}</span></p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : searchQuery && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-8 text-center"
                    >
                      <div className="inline-block px-6 py-3 rounded-xl bg-white/5 backdrop-blur-md">
                        <p className="text-gray-400 font-medium">ไม่พบข้อมูลการซ่อมสำหรับการค้นหานี้</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}