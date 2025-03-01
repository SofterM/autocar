'use client'

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  CircleDollarSign,
  TrendingUp,
  Wallet,
  Wrench,
  ChevronDown,
  Calendar,
  Filter,
  Download
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
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'others', name: 'อื่นๆ' },
    { id: 'engine_repair', name: 'ซ่อมเครื่องยนต์' },
    { id: 'parts_replacement', name: 'เปลี่ยนอะไหล่' },
    { id: 'maintenance', name: 'ตรวจเช็คระยะ' },
    { id: 'electrical_repair', name: 'ซ่อมระบบไฟฟ้า' }
  ];

  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
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
              isUp: data.expensesTrend < 0, // Expense going down is positive
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
      } finally {
        setIsLoading(false);
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

  // Current date formatted in Thai locale
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">ข้อมูลทางการเงิน</h1>
            </div>

            <div className="flex items-center gap-3">
            
              
              <div className="relative">
                
                
                
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with date and export button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">รายงานการเงิน</h1>
                <p className="text-sm lg:text-base text-gray-600">
                  ข้อมูล ณ วันที่ {currentDate}
                </p>
              </div>

              <DownloadButton />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-200"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                ))
              ) : (
                statistics.map((stat, index) => (
                  <StatisticCard key={index} {...stat} />
                ))
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue & Expense Chart */}
              <RevenueExpenseChart data={monthlyData} />

              {/* Profit Trend Chart */}
              <ProfitTrendChart data={monthlyData} />

              {/* Service Distribution Chart */}
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">สัดส่วนบริการ</h3>
                <div className="h-80">
                  <ServiceDistributionChart data={categories} />
                </div>
              </div>

              {/* Recent Transactions */}
              <RecentTransactions limit={5} />
            </div>

            {/* Financial Summary Table */}
            <FinancialSummaryTable />
          </div>
        </main> 
      </div>
    </div>
  );
}