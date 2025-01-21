'use client'

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Download,
  Filter,
  CircleDollarSign,
  TrendingUp,
  Wallet,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { StatisticCard } from '@/components/financial/StatisticCard';
import { RevenueExpenseChart } from '@/components/financial/charts/RevenueExpenseChart';
import { ProfitTrendChart } from '@/components/financial/charts/ProfitTrendChart';
import { ServiceDistributionChart } from '@/components/financial/charts/ServiceDistributionChart';
import { RecentTransactions } from '@/components/financial/RecentTransactions';
import { FinancialSummaryTable } from '@/components/financial/FinancialSummaryTable';
import { MonthlyData, ServiceData, Transaction, Statistic } from '@/types/financial';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function FinancialReports() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: 'ผู้',
    lastName: 'ใช้งาน',
    email: 'user@example.com'
  });

  const monthlyData: MonthlyData[] = [
    { month: 'ม.ค.', revenue: 150000, expenses: 80000, profit: 70000 },
    { month: 'ก.พ.', revenue: 180000, expenses: 85000, profit: 95000 },
    { month: 'มี.ค.', revenue: 160000, expenses: 82000, profit: 78000 },
    { month: 'เม.ย.', revenue: 190000, expenses: 88000, profit: 102000 },
    { month: 'พ.ค.', revenue: 220000, expenses: 95000, profit: 125000 },
    { month: 'มิ.ย.', revenue: 200000, expenses: 90000, profit: 110000 }
  ];

  const serviceData: ServiceData[] = [
    { name: 'ซ่อมเครื่องยนต์', value: 35 },
    { name: 'เปลี่ยนอะไหล่', value: 25 },
    { name: 'ตรวจเช็คระยะ', value: 20 },
    { name: 'ซ่อมระบบไฟฟ้า', value: 15 },
    { name: 'อื่นๆ', value: 5 }
  ];

  const recentTransactions: Transaction[] = [
    {
      service: 'ซ่อมเครื่องยนต์',
      date: '15 มิ.ย. 2024',
      amount: 12500,
      type: 'income'
    },
    {
      service: 'เปลี่ยนอะไหล่',
      date: '14 มิ.ย. 2024', 
      amount: 8750,
      type: 'income'
    },
    {
      service: 'ค่าอะไหล่',
      date: '14 มิ.ย. 2024',
      amount: 5200,
      type: 'expense' 
    }
  ];

  const statistics: Statistic[] = [
    {
      title: 'รายได้รวม',
      value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(1100000),
      trend: '+12.5%',
      isUp: true,
      icon: CircleDollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'กำไรสุทธิ',
      value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(580000),
      trend: '+8.2%',
      isUp: true,
      icon: TrendingUp,
      color: 'bg-emerald-500'
    },
    {
      title: 'ค่าใช้จ่าย',
      value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(520000),
      trend: '+5.1%',
      isUp: true,
      icon: Wallet,
      color: 'bg-amber-500'
    },
    {
      title: 'งานซ่อมทั้งหมด',
      value: '248 รายการ',
      trend: '+3.7%',
      isUp: true,
      icon: Wrench,
      color: 'bg-purple-500'
    }
  ];

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

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className={`fixed lg:relative lg:block z-30 ${isSidebarOpen ? '' : 'hidden'}`}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeMenu="รายงานการเงิน"
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารายการ..."
                  className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-500" />
            </button>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    {userData.firstName.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b lg:hidden">
                      <p className="text-sm font-semibold text-gray-900">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                    </div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      โปรไฟล์
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ตั้งค่า
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      ออกจากระบบ
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="px-4 pb-4 md:hidden">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารายการ..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  รายงานการเงิน
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  ข้อมูล ณ วันที่{' '}
                  {new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  ตัวกรอง
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ช่วงเวลา
                    </label>
                    <select className="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                      <option>ทั้งหมด</option>
                      <option>30 วันล่าสุด</option>
                      <option>3 เดือนล่าสุด</option>
                      <option>6 เดือนล่าสุด</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ประเภทบริการ
                    </label>
                    <select className="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                      <option>ทั้งหมด</option>
                      <option>ซ่อมเครื่องยนต์</option>
                      <option>เปลี่ยนอะไหล่</option>
                      <option>ซ่อมระบบไฟฟ้า</option>
                      <option>อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานะ
                    </label>
                    <select className="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                      <option>ทั้งหมด</option>
                      <option>รายได้</option>
                      <option>ค่าใช้จ่าย</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    นำไปใช้
                  </button>
                </div>
              </div>
            )}

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {statistics.map((stat, index) => (
                <StatisticCard key={index} {...stat} />
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  รายรับและรายจ่าย
                </h3>
                <div className="h-80">
                  <RevenueExpenseChart data={monthlyData} />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  แนวโน้มกำไร
                </h3>
                <div className="h-80">
                  <ProfitTrendChart data={monthlyData} />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  สัดส่วนบริการ
                </h3>
                <div className="h-80">
                  <ServiceDistributionChart data={serviceData} />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    รายการล่าสุด
                  </h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    ดูทั้งหมด
                  </button>
                </div>
                <RecentTransactions transactions={recentTransactions} />
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  สรุปข้อมูลทางการเงิน
                </h3>
              </div>
              <div className="overflow-x-auto">
                <FinancialSummaryTable data={monthlyData} />
              </div>
            </div>
          </div>
        </main> 
      </div>
    </div>
  );
}