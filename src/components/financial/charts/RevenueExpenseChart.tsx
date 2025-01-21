// src/components/financial/charts/RevenueExpenseChart.tsx
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { MonthlyData } from '@/types/financial';

interface RevenueExpenseChartProps {
  data: MonthlyData[];
}

export const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">รายได้ vs ค่าใช้จ่าย</h2>
        </div>
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
            <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} name="รายได้" />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="ค่าใช้จ่าย" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};