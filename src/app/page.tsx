// pages/index.tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import StarryBackground from '@/components/StarryBackground'

const TEXTS = [
  'ระบบซ่อมบำรุงยานพาหนะ',
  'ระบบติดตามการซ่อม',
  'ระบบแจ้งเตือนการบำรุง',
  'ระบบจัดการอะไหล่'
]

export default function Home() {
  const [, setIndex] = useState(0)
  const [currentText, setCurrentText] = useState(TEXTS[0])

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

  return (
    <>
      <StarryBackground />
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
        
        {/* Navbar */}
        <nav className="container mx-auto px-4 sm:px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="rounded-lg"
                priority
              />
              <span className="text-white text-xl sm:text-2xl font-bold">AutoBot</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-[#6C63FF]">หน้าแรก</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">แดชบอร์ด</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">รายงาน</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">ตั้งค่า</a>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">สมัครสมาชิก</button>
              <button className="bg-[#6C63FF] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#5B53FF] transition-all text-sm sm:text-base">
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20">
          <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
            <motion.div
              className="text-center max-w-4xl z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight px-4">
                ระบบจัดการคุณภาพ
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentText}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden h-16 sm:h-24"
                  >
                    <span className="block mt-2 text-[#6C63FF] text-5xl sm:text-7xl font-extrabold">
                      {currentText}
                    </span>
                  </motion.div>
                </AnimatePresence>
                และบริการ
              </h1>

              <motion.p
                className="text-gray-400 text-base sm:text-xl mb-12 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ยกระดับการบริหารจัดการยานพาหนะด้วยระบบอัตโนมัติ 
                ติดตามการซ่อมบำรุง วิเคราะห์ข้อมูล และจัดการงานได้อย่างมีประสิทธิภาพ
              </motion.p>

              <motion.div
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="ค้นหารายการซ่อม..."
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-[#1A1B2E] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                  />
                  <select className="px-4 sm:px-6 py-3 sm:py-4 bg-[#1A1B2E] text-white rounded-xl border-0 focus:ring-2 focus:ring-[#6C63FF]">
                    <option>ทุกประเภท</option>
                    <option>งานซ่อมเครื่องยนต์</option>
                    <option>งานซ่อมช่วงล่าง</option>
                    <option>งานบำรุงรักษาตามระยะ</option>
                  </select>
                  <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5B53FF] transition-all">
                    ค้นหา
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm sm:text-base">
                  <span className="text-gray-400">งานซ่อมยอดนิยม:</span>
                  <a href="#" className="text-[#6C63FF] hover:text-[#5B53FF]">เช็คระยะ 10,000 กม.</a>
                  <span className="text-gray-600">•</span>
                  <a href="#" className="text-[#6C63FF] hover:text-[#5B53FF]">เปลี่ยนน้ำมันเครื่อง</a>
                  <span className="text-gray-600">•</span>
                  <a href="#" className="text-[#6C63FF] hover:text-[#5B53FF]">ตรวจเช็คเบรก</a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}