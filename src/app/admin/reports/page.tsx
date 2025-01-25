'use client'

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
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
import { DownloadButton } from '@/components/financial/DownloadButton';
import { MonthlyData, Transaction, Statistic } from '@/types/financial';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function FinancialReports() {
  const router = useRouter();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: 'ผู้',
    lastName: 'ใช้งาน',
    email: 'user@example.com'
  });

  const categories = [
    { id: 'others', name: 'อื่นๆ' },
    { id: 'engine_repair', name: 'ซ่อมเครื่องยนต์' },
    { id: 'parts_replacement', name: 'เปลี่ยนอะไหล่' },
    { id: 'maintenance', name: 'ตรวจเช็คระยะ' },
    { id: 'electrical_repair', name: 'ซ่อมระบบไฟฟ้า' }
  ];

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const [monthlyResponse, statsResponse] = await Promise.all([
          fetch('/api/financial/monthly-profit'),
          fetch('/api/financial/statistics')
        ]);

        if (monthlyResponse.ok) {
          const data = await monthlyResponse.json();
          setMonthlyData(data);
        }

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStatistics([
            {
              title: 'รายได้รวม',
              value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(data.totalRevenue),
              trend: `${data.revenueTrend > 0 ? '+' : ''}${data.revenueTrend}%`,
              isUp: data.revenueTrend > 0,
              icon: CircleDollarSign,
              color: 'bg-blue-500'
            },
            {
              title: 'กำไรสุทธิ',
              value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(data.totalProfit),
              trend: `${data.profitTrend > 0 ? '+' : ''}${data.profitTrend}%`,
              isUp: data.profitTrend > 0,
              icon: TrendingUp,
              color: 'bg-emerald-500'
            },
            {
              title: 'ค่าใช้จ่าย',
              value: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(data.totalExpenses),
              trend: `${data.expensesTrend > 0 ? '+' : ''}${data.expensesTrend}%`,
              isUp: data.expensesTrend > 0,
              icon: Wallet,
              color: 'bg-amber-500'
            },
            {
              title: 'งานซ่อมทั้งหมด',
              value: `${data.totalRepairs} รายการ`,
              trend: `${data.repairsTrend > 0 ? '+' : ''}${data.repairsTrend}%`,
              isUp: data.repairsTrend > 0,
              icon: Wrench,
              color: 'bg-purple-500'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchFinancialData();
  }, []);
  
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
      <div className={`fixed lg:relative lg:block z-30 ${isSidebarOpen ? '' : 'hidden'}`}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeMenu="รายงานการเงิน"
        />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

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

                {isMobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b lg:hidden">
                      <p className="text-sm font-semibold text-gray-900">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                    </div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">โปรไฟล์</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ตั้งค่า</a>
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">ออกจากระบบ</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">รายงานการเงิน</h1>
                <p className="text-sm lg:text-base text-gray-600">
                  ข้อมูล ณ วันที่{' '}
                  {new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <DownloadButton />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {statistics.map((stat, index) => (
                <StatisticCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">รายรับและรายจ่าย</h3>
                <div className="h-80">
                  <RevenueExpenseChart data={monthlyData} />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">แนวโน้มกำไร</h3>
                <div className="h-80">
                  <ProfitTrendChart />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">สัดส่วนบริการ</h3>
                <div className="h-80">
                  <ServiceDistributionChart data={categories} />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <RecentTransactions limit={5} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">สรุปข้อมูลทางการเงิน</h3>
              </div>
              <div className="overflow-x-auto">
                <FinancialSummaryTable />
              </div>
            </div>
          </div>
        </main> 
      </div>
    </div>
  );
}