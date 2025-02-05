'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { Building2, Mail, Phone, MapPin, Facebook, Send, Map } from 'lucide-react';
import StarryBackground from '@/components/StarryBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Booking {
    id: number
    user_id: number
    service: string
    repair_details: string | null 
    appointment_date: string
    appointment_time: string
    status: 'pending' | 'confirmed' | 'cancelled'
    user: {
        firstName: string
        lastName: string
        phone: string | null
    }
}

interface notiData {
    id: number
    message: {
      name: string
      service: string
      repair_details: string | null 
      phone: string | null
      time: string
      status: 'pending' | 'confirmed' | 'cancelled'
    };
    isRead: boolean
}

export default function NotificationPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [notifications, setNotifications] = useState<notiData[]>([])
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookings()
    }, [currentDate])
 
    useEffect(() => {
        const bookingData: notiData[] = getDayBookings().map(booking => ({
        id: booking.id,
        message: {
            name: booking.user.firstName + " " + booking.user.lastName,
            service: booking.service,
            repair_details: booking.repair_details, 
            phone: booking.user.phone,
            time: booking.appointment_time,
            status: booking.status
        },
        isRead: false
        }))

        setNotifications(bookingData)
    }, [bookings])

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
          const year = currentDate.getFullYear()
          const month = currentDate.getMonth() + 1
          const response = await fetch(`/api/appointments?&year=${year}&month=${month}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch bookings')
          }
          
          const data = await response.json()
          setBookings(data)
        } catch (error) {
          console.error('Error fetching bookings:', error)
        } finally {
            setIsLoading(false);
        }
      }
    
      const getDayBookings = () => {
        return bookings.filter(booking => 
          new Date(booking.appointment_date).getDate() === currentDate.getDate()
        ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
      }

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

 return (
    <div className="flex flex-col min-h-screen">
      <StarryBackground />
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-white mb-6"
              >
                การแจ้งเตือนทั้งหมดในวันนี้
              </motion.h1>
            </div>
 
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-[#6C63FF] border-t-transparent rounded-full" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-12">
                <motion.div 
                             className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700 mb-8"
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.6 }}
                >
                    {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className='py-2'
                        >
                          <div className="flex justify-between items-start bg-black/20 p-6 rounded-xl border border-gray-700/50 hover:border-[#6C63FF]/50 transition-all duration-300">
                            <div className="flex-1 pr-2">
                              <p className="text-xl font-semibold text-[#6C63FF] mb-2 group-hover:text-[#ffffff] transition-colors">
                                {notification.message.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                บริการ: {notification.message.service}
                              </p>
                              {notification.message.repair_details && (
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                รายละเอียด: {notification.message.repair_details}
                              </p>
                              )}
                              {notification.message.phone && (
                                <p className="text-xs sm:text-sm text-gray-400">
                                เบอร์โทรศัพท์: {notification.message.phone}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm text-[#6C63FF] font-medium">
                                {notification.message.time} น.
                              </span>
                              <StatusBadge status={notification.message.status} />
                            </div>
                          </div>
                        </div>
                      ))}
                </motion.div>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-6 text-xl">ไม่มีการแจ้งเตือนในวันนี้</div>
            )}
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
 }
