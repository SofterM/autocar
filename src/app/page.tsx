// src\app\page.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StarryBackground from '@/components/StarryBackground'
import Navbar from '@/components/Navbar'

const TEXTS = [
  'ระบบซ่อมบำรุงยานพาหนะ',
  'ระบบติดตามการซ่อม',
  'ระบบแจ้งเตือนการบำรุง',
  'ระบบจัดการอะไหล่',
  'เมี้ยวๆ'
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
        <Navbar />
        {/* Hero Section */}
        <main className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 lg:pt-20">
          <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
            <motion.div
              className="text-center max-w-4xl z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight px-2 sm:px-4">
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
                className="text-gray-400 text-sm sm:text-base lg:text-xl mb-8 sm:mb-12 px-2 sm:px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ยกระดับการบริหารจัดการยานพาหนะด้วยระบบอัตโนมัติ ติดตามการซ่อมบำรุง วิเคราะห์ข้อมูล และจัดการงานได้อย่างมีประสิทธิภาพ
              </motion.p>
              <motion.div
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-4 lg:p-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="ค้นหารายการซ่อม..."
                    className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-[#1A1B2E] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                  />
                  <select className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-[#1A1B2E] text-white rounded-xl border-0 focus:ring-2 focus:ring-[#6C63FF]">
                    <option>ทุกประเภท</option>
                    <option>งานซ่อมเครื่องยนต์</option>
                    <option>งานซ่อมช่วงล่าง</option>
                    <option>งานบำรุงรักษาตามระยะ</option>
                  </select>
                  <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5B53FF] transition-all">
                    ค้นหา
                  </button>
                </div>
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center text-xs sm:text-sm lg:text-base">
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
