// D:\Github\autocar\src\app\page.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Calendar, Phone, Car, Wrench, CreditCard, FileText } from 'lucide-react'
import StarryBackground from '@/components/StarryBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import debounce from 'lodash/debounce'
import CalendarBookings from '@/components/CalendarBookings'
import Hero from '@/components/Hero'
import WhyChooseUs from '@/components/WhyChooseUs'
import ScrollingServices from '@/components/ScrollingServices'
import EnhancedFeatureSection from '@/components/EnhancedFeatureSection'
import ChatButton from '@/components/VehicleChatbot/ChatButton'

const TEXTS = [
  { text: 'ระบบซ่อมบำรุงยานพาหนะ', blur: 4 },
  { text: 'ระบบติดตามการซ่อม', blur: 3 },
  { text: 'ระบบแจ้งเตือนการบำรุง', blur: 2 },
  { text: 'ระบบจัดการอะไหล่', blur: 1 }
];

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
  const [blur, setBlur] = useState(TEXTS[0].blur);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % TEXTS.length;
        setBlur(TEXTS[newIndex].blur);
        return newIndex;
      });
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

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
      completed: 'bg-green-500 text-white',
      in_progress: 'bg-blue-500 text-white',
      pending: 'bg-yellow-500 text-white',
      cancelled: 'bg-red-500 text-white'
    }
    return styleMap[status] || 'bg-gray-500 text-white'
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
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                ระบบจัดการคุณภาพ
                <AnimatePresence mode='wait'>
    <motion.div
      key={TEXTS[currentIndex].text}
      initial={{ opacity: 0, y: 20, filter: `blur(${blur * 2}px)` }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: `blur(${blur * 2}px)` }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden h-12 sm:h-16 lg:h-24"
    >
      <span className="block mt-2 text-[#6C63FF] text-4xl sm:text-5xl lg:text-7xl font-semibold">
        {TEXTS[currentIndex].text}
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
                className="bg-gray-900/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="relative">
                  <div className="relative bg-gray-800 rounded-xl border border-gray-700 transition-all hover:border-[#6C63FF]/50">
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
                      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-800">
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
                        <span className="text-gray-300">กำลังค้นหา...</span>
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
                          className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#6C63FF]/50 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Car className="h-5 w-5 text-[#6C63FF]" />
                                <h3 className="font-semibold text-white text-lg">
                                  {repair.brand} {repair.model}
                                </h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-white">
                                  {repair.license_plate}
                                </span>
                                {repair.color && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-white">
                                    สี{repair.color}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(repair.status)}`}>
                              {getStatusText(repair.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <FileText className="h-5 w-5 text-[#6C63FF]" />
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm mb-1">ข้อมูลลูกค้า</p>
                                  <p className="text-white">{repair.customer.name}</p>
                                  <p className="text-white">{formatPhoneNumber(repair.customer.phone)}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <Calendar className="h-5 w-5 text-[#6C63FF]" />
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm mb-1">วันที่</p>
                                  <p className="text-white">รับรถ: {formatDate(repair.start_date)}</p>
                                  <p className="text-white">นัดรับ: {formatDate(repair.expected_end_date)}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <Wrench className="h-5 w-5 text-[#6C63FF]" />
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm mb-1">ข้อมูลการซ่อม</p>
                                  <p className="text-white">เลขไมล์: {repair.mileage.toLocaleString()} กม.</p>
                                  {repair.description && (
                                    <p className="text-white mt-1">{repair.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <CreditCard className="h-5 w-5 text-[#6C63FF]" />
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm mb-1">ค่าใช้จ่าย</p>
                                  <p className="text-white">ประเมินราคา: ฿{repair.estimated_cost.toLocaleString()}</p>
                                  {repair.final_cost !== null && (
                                    <p className="text-white">ค่าซ่อมจริง: ฿{repair.final_cost.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                            </div>
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
          <div className="mt-24">
          <Hero />
          </div>
        </main>
        
      </div>
      
  <CalendarBookings />
  <ScrollingServices />
  <WhyChooseUs />
  <EnhancedFeatureSection />
  <Footer />
  <ChatButton />                

    </div>
  )
}