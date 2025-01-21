'use client'

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  TrendingUp,
  Wallet,
  Wrench
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import Sidebar from '@/components/admin/Sidebar';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ServiceData {
  name: string;
  value: number;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface Statistic {
  title: string;
  value: string;
  trend: string;
  isUp: boolean;
  icon: any;
  color: string;
}

// Chart Components
const RevenueExpenseChart = ({ data }: { data: MonthlyData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value) => new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
          }).format(value as number)}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#4F46E5" 
          strokeWidth={2}
          name="รายได้"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#EF4444" 
          strokeWidth={2}
          name="ค่าใช้จ่าย"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const ProfitTrendChart = ({ data }: { data: MonthlyData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value) => new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
          }).format(value as number)}
        />
        <Legend />
        <Bar 
          dataKey="profit" 
          fill="#10B981"
          name="กำไร"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const ServiceDistributionChart = ({ data }: { data: ServiceData[] }) => {
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          label={({name, value}) => `${name} (${value}%)`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

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

export default function FinancialReports() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: 'ผู้',
    lastName: 'ใช้งาน',
    email: 'user@example.com'
  });

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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(value);
  };

  const statistics: Statistic[] = [
    {
      title: 'รายได้รวม',
      value: formatCurrency(1100000),
      trend: '+12.5%',
      isUp: true,
      icon: CircleDollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'กำไรสุทธิ',
      value: formatCurrency(580000),
      trend: '+8.2%',
      isUp: true,
      icon: TrendingUp,
      color: 'bg-emerald-500'
    },
    {
      title: 'ค่าใช้จ่าย',
      value: formatCurrency(520000),
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

  const recentTransactions = [
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">รายได้ vs ค่าใช้จ่าย</h2>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  <RevenueExpenseChart data={monthlyData} />
                </div>
              </div>

              {/* Profit Trend Chart */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">แนวโน้มกำไร</h2>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  <ProfitTrendChart data={monthlyData} />
                </div>
              </div>

              {/* Service Distribution Chart */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">สัดส่วนประเภทงานซ่อม</h2>
                  </div>
                  <ServiceDistributionChart data={serviceData} />
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">รายการล่าสุด</h2>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      ดูทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.service}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <p className={`text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          ฿{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics Section */}
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">สรุปผลประกอบการ</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="monthly">รายเดือน</option>
                    <option value="quarterly">รายไตรมาส</option>
                    <option value="yearly">รายปี</option>
                  </select>
                  <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 border-b">เดือน</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-b">รายได้</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-b">ค่าใช้จ่าย</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-b">กำไรสุทธิ</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-b">อัตรากำไร</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((data, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{data.month}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {formatCurrency(data.revenue)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {formatCurrency(data.expenses)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {formatCurrency(data.profit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {((data.profit / data.revenue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">รวม</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(monthlyData.reduce((sum, data) => sum + data.revenue, 0))}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(monthlyData.reduce((sum, data) => sum + data.expenses, 0))}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(monthlyData.reduce((sum, data) => sum + data.profit, 0))}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        {(monthlyData.reduce((sum, data) => sum + data.profit, 0) / 
                          monthlyData.reduce((sum, data) => sum + data.revenue, 0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}