'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign } from 'lucide-react';

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
        delay: i * 0.1,
        duration: 0.3,
        ease: 'easeOut'
      }
    }),
    exit: { opacity: 0, y: -20 }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">สรุปผลประกอบการ</h2>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-colors hover:bg-gray-50"
            >
              <option value="monthly">รายเดือน</option>
              <option value="quarterly">รายไตรมาส</option>
              <option value="yearly">รายปี</option>
            </select>
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-colors hover:bg-gray-50"
          >
            {getYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{period === 'monthly' ? 'เดือน' : period === 'quarterly' ? 'ไตรมาส' : 'ปี'}</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">รายได้</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">ค่าใช้จ่าย</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">กำไรสุทธิ</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">อัตรากำไร</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode='wait'>
              {data.map((item, index) => (
                <motion.tr
                  key={item.period}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{item.period}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600 text-right font-medium">
                    {formatCurrency(item.expenses)}
                  </td>
                  <td className="py-3 px-4 text-sm text-emerald-600 text-right font-medium">
                    {formatCurrency(item.profit)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {calculateProfitMargin(item.profit, item.revenue)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
          <tfoot>
            <motion.tr 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 font-semibold"
            >
              <td className="py-3 px-4 text-sm text-gray-900">รวม</td>
              <td className="py-3 px-4 text-sm text-gray-900 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </td>
              <td className="py-3 px-4 text-sm text-red-600 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
              </td>
              <td className="py-3 px-4 text-sm text-emerald-600 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 text-right">
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