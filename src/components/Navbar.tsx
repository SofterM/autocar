'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FaCog, FaBell } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'technician' | 'staff';
  phone: string | null;
}

interface AuthResponse {
  token: string;
  user: UserType;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "มีการแจ้งเตือนใหม่", isRead: false },
    { id: 2, message: "ระบบอัพเดทเรียบร้อยแล้ว", isRead: true },
  ])
  
  const pathname = usePathname()
  const router = useRouter()
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        handleLogout()
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleAuthResponse = (response: AuthResponse) => {
    const { token, user } = response
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    setShowLoginModal(false)
    setShowRegisterModal(false)
    toast.success('เข้าสู่ระบบสำเร็จ')
    
    if (user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
    toast.success('ออกจากระบบสำเร็จ')
  }

  const getMenuItems = () => {
    const baseMenuItems = [
      { name: 'หน้าแรก', path: '/' },
      { name: 'จองคิว', path: '/reports' },
      { name: 'ช่องทางการติดต่อ', path: '/contact' },
    ]

    if (user && (user.role === 'admin' || user.role === 'technician')) {
      return [
        baseMenuItems[0],
        { name: 'แดชบอร์ด', path: '/admin' },
        ...baseMenuItems.slice(1)
      ]
    }

    return baseMenuItems
  }

  const menuItems = getMenuItems()
  const unreadNotifications = notifications.filter(n => !n.isRead).length

  const handleNotificationClick = (notificationId: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    ))
  }

  return (
    <>
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
          >
            <div className="w-10 h-10 bg-[#6C63FF] rounded-lg flex items-center justify-center">
              <FaCog className="text-white text-2xl animate-spin-slow" />
            </div>
            <span className="text-white text-xl sm:text-2xl font-bold">AutoService</span>
          </motion.div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 rounded-lg transition-colors
                  ${pathname === item.path ? 'text-[#6C63FF]' : 'text-gray-300 hover:text-white'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {pathname === item.path && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.name}
              </motion.a>
            ))}
          </div>

          {user ? (
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-300 hover:text-white relative"
                >
                  <FaBell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-lg py-2 text-gray-800"
                    >
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm">{notification.message}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <span>{user.firstName} {user.lastName}</span>
                  <ChevronDown size={20} />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg py-2"
                    >
                      <button
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {/* Handle profile click */}}
                      >
                        <User size={16} />
                        <span>โปรไฟล์</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {/* Handle settings click */}}
                      >
                        <Settings size={16} />
                        <span>ตั้งค่า</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                onClick={() => setShowRegisterModal(true)}
                className="text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                สมัครสมาชิก
              </motion.button>
              <motion.button
                onClick={() => setShowLoginModal(true)}
                className="bg-[#6C63FF] text-white px-6 py-2 rounded-lg"
                whileHover={{ scale: 1.05, backgroundColor: "#5B53FF" }}
                whileTap={{ scale: 0.95 }}
              >
                เข้าสู่ระบบ
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 bg-[#1A1B2E]/95 backdrop-blur-md rounded-lg p-4"
            >
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pathname === item.path ? 'text-[#6C63FF] bg-white/10' : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                
                {user ? (
                  <>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="px-4 py-2 text-gray-300">
                        {user.firstName} {user.lastName}
                      </div>
                      <button
                        className="w-full px-4 py-2 text-left text-gray-300 hover:text-white flex items-center space-x-2"
                        onClick={() => {/* Handle profile click */}}
                      >
                        <User size={16} />
                        <span>โปรไฟล์</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-gray-300 hover:text-white flex items-center space-x-2"
                        onClick={() => {/* Handle settings click */}}
                      >
                        <Settings size={16} />
                        <span>ตั้งค่า</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-red-500 hover:text-red-400 flex items-center space-x-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 bg-[#6C63FF] text-white rounded-lg hover:bg-[#5B53FF] transition-colors"
                    >
                      เข้าสู่ระบบ
                    </button>
                    <button
                      onClick={() => {
                        setShowRegisterModal(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      สมัครสมาชิก
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        isDark={true}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        isDark={true}
        onSuccess={handleAuthResponse}
      />
    </>
  )
}