// src/app/financial-reports/page.tsx
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
  Wrench
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

    setIsSidebarOpen(window.innerWidth >= 1024);

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        activeMenu="รายงานการเงิน" 
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
                  placeholder="ค้นหารายการ..."
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">รายงานการเงิน</h1>
                <p className="text-sm lg:text-base text-gray-600">
                  ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  ตัวกรอง
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  ดาวน์โหลดรายงาน
                </button>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {statistics.map((stat, index) => (
                <StatisticCard key={index} {...stat} />
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueExpenseChart data={monthlyData} />
              <ProfitTrendChart data={monthlyData} />
              <ServiceDistributionChart data={serviceData} />
              <RecentTransactions transactions={recentTransactions} />
            </div>
          </div>

          {/* Additional Metrics Section */}
          <div className="mt-6">
            <FinancialSummaryTable data={monthlyData} />
          </div>
        </main>
      </div>
    </div>
  );
}