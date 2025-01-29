'use client'

import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  Wrench,
  Clock,
  Users,
  ChevronRight,
  Bell,
  Search,
  Menu,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { AddRepairModal } from '@/components/AddRepairModal';
import { Repair } from '@/types/repairs';
import { User } from '@/types/user';
import { Appointment, TodayAppointment } from '@/types/appointment';
import { getStatusText, getStatusBadgeStyle } from '@/utils/format';

const AdminDashboard = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userData, setUserData] = useState({ email: '', firstName: '', lastName: '' });
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [recentRepairs, setRecentRepairs] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData({
        email: user.email,
        firstName: user.firstName || 'ผู้',
        lastName: user.lastName || 'ใช้งาน'
      });
    }

    setIsSidebarOpen(window.innerWidth >= 1024);

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchRepairs(), fetchUsers(), fetchAppointments()]);
    } finally {
      setIsLoading(false);
    }
  };

  const STATUS_STYLES = {
    pending: { class: 'bg-yellow-100 text-yellow-800', text: 'รอดำเนินการ' },
    confirmed: { class: 'bg-blue-100 text-blue-800', text: 'ยืนยันแล้ว' },
    cancelled: { class: 'bg-red-100 text-red-800', text: 'ยกเลิก' }
  };

  const getTodayAppointments = (appointments: Appointment[]) => {
    // สร้างวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA'); // รูปแบบ YYYY-MM-DD
  
    return appointments
      .filter(appointment => {
        // แปลง appointment_date เป็นรูปแบบ YYYY-MM-DD
        const appointmentDate = new Date(appointment.appointment_date)
          .toLocaleDateString('en-CA');
        return appointmentDate === todayStr;
      })
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
      .map(appointment => ({
        id: appointment.id,
        time: appointment.appointment_time,
        customerName: `${appointment.user?.firstName || ''} ${appointment.user?.lastName || ''}`.trim() || 'ไม่ระบุ',
        phone: appointment.user?.phone || 'ไม่ระบุ',
        service: appointment.service || 'ไม่ระบุ',
        repair_details: appointment.repair_details || '',
        status: appointment.status
      }));
  };
  

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data || []);
        setTodayAppointments(getTodayAppointments(data));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRepairs = async () => {
    try {
      const response = await fetch('/api/repairs');
      if (response.ok) {
        const data = await response.json();
        setRepairs(data || []);
        setRecentRepairs(getRecentRepairs(data));
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
    }
  };

  const getTimeLeft = (repair: Repair) => {
    if (repair.status === 'completed') return 'เสร็จสิ้น';
    if (repair.status === 'cancelled') return 'ยกเลิก';
    
    if (repair.expected_end_date) {
      const expectedDate = new Date(repair.expected_end_date);
      const now = new Date();
      const diffTime = expectedDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      
      if (diffDays > 1) return `ครบกำหนดในอีก ${diffDays} วัน`;
      if (diffHours > 0) return `ครบกำหนดในอีก ${diffHours} ชั่วโมง`;
      return 'เกินกำหนด';
    }
    
    return 'ไม่ระบุ';
  };

  const getRecentRepairs = (repairs: Repair[]) => {
    return repairs
      .sort((a: Repair, b: Repair) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((repair: Repair) => ({
        id: repair.id,
        customer: repair.customer?.name,
        carModel: `${repair.brand} ${repair.model}`,
        service: repair.description,
        license_plate: repair.license_plate,
        status: getStatusText(repair.status),
        statusColor: getStatusBadgeStyle(repair.status),
        assignedTo: repair.technician?.name ? `ช่าง${repair.technician.name}` : 'ยังไม่กำหนด',
        timeLeft: getTimeLeft(repair)
      }));
  };

  const completedRepairs = repairs.filter(r => r?.status === 'completed');
  const totalRevenue = completedRepairs.reduce((sum, repair) => sum + (repair?.final_cost || 0), 0);
  const pendingRepairs = repairs.filter(r => r?.status === 'pending').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const statistics = [
    {
      title: 'รายได้ประจำเดือน',
      value: `฿${formatCurrency(totalRevenue)}`,
      trend: '+12.5%',
      isUp: true,
      icon: CircleDollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'งานซ่อมทั้งหมด',
      value: repairs.length.toString(),
      trend: '+8.2%',
      isUp: true,
      icon: Wrench,
      color: 'bg-purple-500'
    },
    {
      title: 'รอดำเนินการ',
      value: pendingRepairs.toString(),
      trend: '-5.1%',
      isUp: false,
      icon: Clock,
      color: 'bg-amber-500'
    },
    {
      title: 'ผู้ใช้งานทั้งหมด',
      value: users.length.toString(),
      trend: '+3.7%',
      isUp: true,
      icon: Users,
      color: 'bg-emerald-500'
    }
  ];

  const handleCreateNewRepair = () => {
    setIsAddModalOpen(true);
  };

  const handleAddRepairSuccess = () => {
    setIsAddModalOpen(false);
    fetchRepairs();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        activeMenu="แดชบอร์ด" 
      />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหางานซ่อม, ลูกค้า, หรือช่าง..."
                  className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              <div className="hidden sm:flex items-center gap-3 border-l pl-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {userData.firstName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{userData.firstName} {userData.lastName}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ยินดีต้อนรับ, คุณ{userData.firstName}</h1>
                <p className="text-sm lg:text-base text-gray-600">นี่คือภาพรวมของระบบในวันที่ {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button 
                onClick={handleCreateNewRepair}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + สร้างงานใหม่
              </button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-4 lg:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`p-3 rounded-xl ${stat.color} text-white`}>
                        <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                      </span>
                      <span className={`flex items-center gap-1 text-sm font-semibold ${
                        stat.isUp ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {stat.trend}
                        {stat.isUp ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Recent Repairs */}
<div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
  <div className="p-4 lg:p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">งานซ่อมล่าสุด</h2>
      <button
        onClick={() => router.push('/admin/repairs')}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ดูทั้งหมด
      </button>
    </div>
    <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-100 hover:scrollbar-thumb-indigo-700">
      <div className="space-y-4">
        {recentRepairs.map((repair) => (
          <div 
            key={repair.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 
            hover:border-indigo-200 hover:shadow-md transition-all duration-200 gap-4 bg-white">
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{repair.customer}</p>
                <p className="text-sm text-gray-600">{repair.carModel}</p>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${repair.statusColor}`}>
                    {repair.status}
                  </span>
                  <span className="text-gray-500">• {repair.assignedTo}</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-medium text-gray-900">{repair.service || '-'}</p>
                <p className="text-sm text-gray-500 mt-1">{repair.timeLeft}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

              {/* Today's Appointments */}
<div className="bg-white rounded-xl shadow-sm">
  <div className="p-4 lg:p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">นัดหมายวันนี้</h2>
      <button
        onClick={() => router.push('/admin/appointments')}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ดูทั้งหมด
      </button>
    </div>
    <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-100 hover:scrollbar-thumb-indigo-700">
      <div className="space-y-4">
        {todayAppointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 
            hover:border-indigo-200 hover:shadow-md transition-all duration-200 gap-4 bg-white"
          >
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{appointment.customerName}</p>
                            <p className="text-sm text-gray-600">{appointment.phone}</p>
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[appointment.status as keyof typeof STATUS_STYLES]?.class || 'bg-gray-100 text-gray-800'}`}>
                                {STATUS_STYLES[appointment.status as keyof typeof STATUS_STYLES]?.text || 'ไม่ระบุ'}
                              </span>
                              <span className="text-gray-500">• {appointment.time}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{appointment.service}</p>
                            <p className="text-sm text-gray-500 mt-1">{appointment.repair_details}</p>
                          </div>
                        </div>
                      ))}
                      {todayAppointments.length === 0 && (
                        <div className="text-center py-6 border border-gray-100 rounded-lg">
                          <p className="text-sm text-gray-500">ไม่มีนัดหมายในวันนี้</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddRepairModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddRepairSuccess}
      />
    </div>
  );
};

export default AdminDashboard;