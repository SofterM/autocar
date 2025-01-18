'use client'

// Previous imports remain the same
import React, { useState } from 'react';
import {
  Users,
  CircleDollarSign,
  Wrench,
  Car,
  Bell,
  LayoutDashboard,
  ChevronRight,
  Star,
  Package,
  MessageSquare,
  BarChart3,
  Calendar,
  Menu,
  Search,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Previous data structures remain the same
  const quickStats = [
    {
      label: 'งานซ่อมวันนี้',
      value: '24',
      change: '+12.5%',
      trend: 'up',
      icon: Wrench,
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600'
    },
    {
      label: 'รายได้รวม',
      value: '฿45,892',
      change: '+8.2%',
      trend: 'up',
      icon: CircleDollarSign,
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    {
      label: 'งานรอดำเนินการ',
      value: '12',
      change: '-2.5%',
      trend: 'down',
      icon: Calendar,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      label: 'ความพึงพอใจ',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600'
    }
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', active: true },
    { icon: Car, label: 'จัดการงานซ่อม' },
    { icon: Users, label: 'จัดการพนักงาน' },
    { icon: Package, label: 'คลังอะไหล่' },
    { icon: BarChart3, label: 'รายงาน' },
    { icon: Bell, label: 'การแจ้งเตือน' },
    { icon: MessageSquare, label: 'รีวิวและคะแนน' }
  ];

  const recentTasks = [
    {
      id: 1,
      customer: 'คุณสมชาย ใจดี',
      service: 'เปลี่ยนน้ำมันเครื่อง',
      status: 'กำลังดำเนินการ',
      statusColor: 'text-amber-600',
      tech: 'ช่างวิชัย',
      time: '2 ชั่วโมง'
    },
    {
      id: 2,
      customer: 'คุณวิภา รักดี',
      service: 'ตรวจเช็คระบบเบรก',
      status: 'รอดำเนินการ',
      statusColor: 'text-blue-600',
      tech: 'ช่างสมศักดิ์',
      time: '3 ชั่วโมง'
    },
    {
      id: 3,
      customer: 'คุณมานะ ศรีสุข',
      service: 'เปลี่ยนยาง',
      status: 'เสร็จสิ้น',
      statusColor: 'text-emerald-600',
      tech: 'ช่างประสิทธิ์',
      time: '1 ชั่วโมง'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Wrench className="h-6 w-6 text-indigo-600" />
              </div>
              {isSidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">PowerPuff Boys</h1>
                  <p className="text-sm font-medium text-gray-700">ระบบจัดการซ่อมบำรุง</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200
                  ${item.active 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <button className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200">
                <Settings className="h-5 w-5" />
                {isSidebarOpen && <span className="font-medium">ตั้งค่า</span>}
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200">
                <HelpCircle className="h-5 w-5" />
                {isSidebarOpen && <span className="font-medium">ช่วยเหลือ</span>}
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200">
                <LogOut className="h-5 w-5" />
                {isSidebarOpen && <span className="font-medium">ออกจากระบบ</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-5 w-5 text-gray-700" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-medium">
                  A
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-sm text-gray-700">admin@powerpuff.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                          <span className={`text-sm font-semibold ${
                            stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor} text-white`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">งานล่าสุด</h2>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    ดูทั้งหมด
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-semibold text-gray-700">
                        <th className="pb-4">ลูกค้า</th>
                        <th className="pb-4">บริการ</th>
                        <th className="pb-4">สถานะ</th>
                        <th className="pb-4">ช่าง</th>
                        <th className="pb-4">เวลา</th>
                        <th className="pb-4"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {recentTasks.map((task) => (
                        <tr key={task.id} className="border-t border-gray-200">
                          <td className="py-4 text-gray-900 font-medium">{task.customer}</td>
                          <td className="py-4 text-gray-900">{task.service}</td>
                          <td className="py-4">
                            <span className={`font-semibold ${task.statusColor}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-900">{task.tech}</td>
                          <td className="py-4 text-gray-700">{task.time}</td>
                          <td className="py-4">
                            <button className="text-gray-500 hover:text-gray-700">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;