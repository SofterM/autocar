'use client'
import { useState } from 'react'
import { FaCog } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 py-4 relative z-10"
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-10 h-10 bg-[#6C63FF] rounded-lg flex items-center justify-center">
            <FaCog className="text-white text-2xl animate-spin-slow" />
          </div>
          <span className="text-white text-xl sm:text-2xl font-bold">AutoCar</span>
        </motion.div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {['หน้าแรก', 'แดชบอร์ด', 'รายงาน', 'ตั้งค่า'].map((item, index) => (
            <motion.a
              key={item}
              href="#"
              className={`${index === 0 ? 'text-[#6C63FF]' : 'text-gray-300 hover:text-white'} transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button 
          className="md:hidden text-white"
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </motion.button>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.button 
            className="text-gray-300 hover:text-white transition-colors text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            สมัครสมาชิก
          </motion.button>
          <motion.button 
            className="bg-[#6C63FF] text-white px-6 py-2 rounded-lg hover:bg-[#5B53FF] transition-all text-base"
            whileHover={{ scale: 1.05, backgroundColor: "#5B53FF" }}
            whileTap={{ scale: 0.95 }}
          >
            เข้าสู่ระบบ
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 bg-[#1A1B2E]/95 backdrop-blur-md rounded-lg p-4 overflow-hidden"
          >
            <div className="flex flex-col space-y-4">
              {['หน้าแรก', 'แดชบอร์ด', 'รายงาน', 'ตั้งค่า'].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className={`${index === 0 ? 'text-[#6C63FF]' : 'text-gray-300 hover:text-white'} transition-colors`}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.div 
                className="pt-4 border-t border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button 
                  className="w-full text-gray-300 hover:text-white transition-colors text-sm mb-2"
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  สมัครสมาชิก
                </motion.button>
                <motion.button 
                  className="w-full bg-[#6C63FF] text-white px-4 py-2 rounded-lg hover:bg-[#5B53FF] transition-all text-sm"
                  whileHover={{ scale: 1.02, backgroundColor: "#5B53FF" }}
                  whileTap={{ scale: 0.95 }}
                >
                  เข้าสู่ระบบ
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
