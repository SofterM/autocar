'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: number
  user_id: number
  service: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  user: {
    firstName: string
    lastName: string
    phone: string | null
  }
}

interface CalendarBookingsProps {
  className?: string
}

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const getStatusColor = (status: Booking['status']) => {
  const colors = {
    pending: 'bg-yellow-500 text-white',
    confirmed: 'bg-green-500 text-white',
    cancelled: 'bg-red-500 text-white'
  }
  return colors[status] || 'bg-gray-500 text-white'
}

const StatusBadge = ({ status }: { status: Booking['status'] }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs ${getStatusColor(status)}`}>
    {status === 'pending' && 'รอยืนยัน'}
    {status === 'confirmed' && 'ยืนยันแล้ว'}
    {status === 'cancelled' && 'ยกเลิก'}
  </span>
)

export default function CalendarBookingsContainer({ className }: CalendarBookingsProps) {
  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header outside the card */}
      <div className="mb-6 text-center">
        <div className="inline-block bg-[#6C63FF]/10 px-4 py-2 rounded-full mb-2">
          <div className="flex items-center justify-center gap-2 text-[#6C63FF]">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold text-sm">ระบบจัดการนัดหมาย</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          ปฏิทินการจองคิวซ่อม
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-6">
          เลือกวันที่ต้องการเพื่อดูรายละเอียดการจอง วางแผนและติดตามคิวซ่อมของคุณได้อย่างง่ายดาย
        </p>
      </div>

      {/* Calendar Component */}
      <CalendarBookings className={className} />
    </div>
  )
}

function CalendarBookings({ className }: CalendarBookingsProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [currentDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await fetch(`/api/appointments?year=${year}&month=${month}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('ไม่สามารถโหลดข้อมูลการจองได้')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="h-12 sm:h-16 md:h-20 border border-gray-700 bg-gray-800/50 rounded-lg"
        />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayBookings = bookings.filter(booking => 
        new Date(booking.appointment_date).getDate() === day
      )
      
      days.push(
        <motion.div 
          key={day}
          onClick={() => setSelectedDate(date)}
          whileHover={{ scale: 1.05 }}
          className={`
            h-16 sm:h-20 md:h-24 border border-gray-700 bg-gray-800/50 p-1 sm:p-2
            cursor-pointer hover:bg-gray-700/50 transition-all rounded-lg
            relative overflow-hidden
            ${selectedDate?.getDate() === day ? 'ring-2 ring-[#6C63FF]' : ''}
          `}
        >
          <span className="text-xs sm:text-sm text-white">{day}</span>
          {dayBookings.length > 0 && (
            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
              <div className="bg-[#6C63FF]/20 text-[#6C63FF] text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-md">
                {dayBookings.length} การจอง
              </div>
            </div>
          )}
        </motion.div>
      )
    }

    return days
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getDayBookings = () => {
    if (!selectedDate) return []
    return bookings.filter(booking => 
      new Date(booking.appointment_date).getDate() === selectedDate.getDate()
    ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
  }

  return (
    <div className={`bg-gray-900/95 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-20 shadow-xl ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 sm:p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <span className="text-sm sm:text-base text-white font-medium">
            {currentDate.toLocaleDateString('th-TH', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 sm:p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#6C63FF]" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 sm:h-96 text-red-500">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-gray-400 text-xs sm:text-sm py-1 sm:py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {generateCalendarDays()}
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  {selectedDate.toLocaleDateString('th-TH', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {getDayBookings().length === 0 ? (
                  <div className="text-center text-gray-400 py-6">
                    ไม่มีการจองในวันนี้
                  </div>
                ) : (
                  getDayBookings().map(booking => (
                    <div
                      key={booking.id}
                      className="bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <p className="text-sm sm:text-base font-medium text-white">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            {booking.service}
                          </p>
                          {booking.user.phone && (
                            <p className="text-xs sm:text-sm text-gray-400">
                              {booking.user.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm text-[#6C63FF] font-medium">
                            {booking.appointment_time} น.
                          </span>
                          <StatusBadge status={booking.status} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}