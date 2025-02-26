'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, Download, Filter, ArrowUpDown } from 'lucide-react';

interface SummaryData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export const FinancialSummaryTable = () => {
  const [data, setData] = useState<SummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/financial/summary?period=${period}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, year]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateProfitMargin = (profit: number, revenue: number): string => {
    if (!revenue) return '0.0%';
    return `${((profit / revenue) * 100).toFixed(1)}%`;
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 5}, (_, i) => currentYear - i);
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
        ease: 'easeOut'
      }
    }),
    exit: { opacity: 0, y: -20 }
  };

  // Sorting function
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = () => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof SummaryData];
      const bValue = b[sortConfig.key as keyof SummaryData];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4"><div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="py-3 px-4"><div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 px-4"><div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="py-3 px-4"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">สรุปผลประกอบการ</h2>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-colors hover:bg-gray-50 w-full"
              >
                <option value="monthly">รายเดือน</option>
                <option value="quarterly">รายไตรมาส</option>
                <option value="yearly">รายปี</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-colors hover:bg-gray-50 w-28"
            >
              {getYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th 
                className="text-left py-4 px-6 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => requestSort('period')}
              >
                <div className="flex items-center gap-2">
                  <span>{period === 'monthly' ? 'เดือน' : period === 'quarterly' ? 'ไตรมาส' : 'ปี'}</span>
                  {sortConfig?.key === 'period' && (
                    <ArrowUpDown className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-4 px-6 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => requestSort('revenue')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span>รายได้</span>
                  {sortConfig?.key === 'revenue' && (
                    <ArrowUpDown className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-4 px-6 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => requestSort('expenses')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span>ค่าใช้จ่าย</span>
                  {sortConfig?.key === 'expenses' && (
                    <ArrowUpDown className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-4 px-6 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => requestSort('profit')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span>กำไรสุทธิ</span>
                  {sortConfig?.key === 'profit' && (
                    <ArrowUpDown className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">อัตรากำไร</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode='wait'>
              {sortedData.map((item, index) => (
                <motion.tr
                  key={item.period}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors"
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.period}</td>
                  <td className="py-4 px-6 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="py-4 px-6 text-sm text-red-600 text-right font-medium">
                    {formatCurrency(item.expenses)}
                  </td>
                  <td className="py-4 px-6 text-sm text-emerald-600 text-right font-medium">
                    {formatCurrency(item.profit)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 text-right">
                    <span className={`py-1 px-2 rounded-full text-xs font-medium ${
                      parseFloat(calculateProfitMargin(item.profit, item.revenue)) > 15 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : parseFloat(calculateProfitMargin(item.profit, item.revenue)) > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {calculateProfitMargin(item.profit, item.revenue)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
          <tfoot>
            <motion.tr 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-indigo-50/50 font-semibold"
            >
              <td className="py-4 px-6 text-sm text-gray-900 font-bold">รวมทั้งสิ้น</td>
              <td className="py-4 px-6 text-sm text-gray-900 text-right font-bold">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </td>
              <td className="py-4 px-6 text-sm text-red-600 text-right font-bold">
                {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
              </td>
              <td className="py-4 px-6 text-sm text-emerald-600 text-right font-bold">
                {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}
              </td>
              <td className="py-4 px-6 text-sm text-gray-900 text-right font-bold">
                {calculateProfitMargin(
                  data.reduce((sum, item) => sum + item.profit, 0),
                  data.reduce((sum, item) => sum + item.revenue, 0)
                )}
              </td>
            </motion.tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
};