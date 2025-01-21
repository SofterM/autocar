// src/components/financial/charts/ServiceDistributionChart.tsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ServiceData } from '@/types/financial';

interface ServiceDistributionChartProps {
  data: ServiceData[];
}

export const ServiceDistributionChart = ({ data }: ServiceDistributionChartProps) => {
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">สัดส่วนประเภทงานซ่อม</h2>
        </div>
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
      </div>
    </div>
  );
};