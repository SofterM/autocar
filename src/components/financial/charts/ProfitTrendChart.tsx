// src/components/financial/charts/ProfitTrendChart.tsx
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { MonthlyData } from '@/types/financial';

interface ProfitTrendChartProps {
  data: MonthlyData[];
}

export const ProfitTrendChart = ({ data }: ProfitTrendChartProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">แนวโน้มกำไร</h2>
        </div>
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
            <Bar dataKey="profit" fill="#10B981" name="กำไร" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};