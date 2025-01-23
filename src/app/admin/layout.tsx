'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AdminLayoutProps {
  children: React.ReactNode
}

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-gray-700 dark:text-gray-300 text-lg font-medium">กำลังโหลด</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">กรุณารอสักครู่...</p>
      </div>
    </div>
  </div>
)

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    async function verifyAccess() {
      if (!isLoading && user) {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            router.push('/')
            return
          }

          const response = await fetch('/api/auth/check-admin', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          const data = await response.json()

          if (!response.ok || !data.success || !data.isAllowed) {
            router.push('/')
            return
          }

          setIsVerifying(false)

        } catch (error) {
          console.error('Access verification error:', error)
          router.push('/')
        }
      } else if (!isLoading && !user) {
        router.push('/')
      }
    }

    verifyAccess()
  }, [user, isLoading, router])

  if (isLoading || isVerifying) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  )
}