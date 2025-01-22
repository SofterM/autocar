import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface RepairCategory {
  id: string;
  name: string;
}

interface ServiceData {
  name: string;
  value: number;
}

interface ServiceDistributionChartProps {
  data: RepairCategory[];
}

export const ServiceDistributionChart = ({ data }: ServiceDistributionChartProps) => {
  const [chartData, setChartData] = useState<ServiceData[]>([]);
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchServiceDistribution = async () => {
      try {
        const response = await fetch('/api/repairs');
        const repairs = await response.json();

        // Count repairs by category
        const categoryCounts = repairs.reduce((acc: { [key: string]: number }, repair: any) => {
          const category = repair.category || 'others';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        // Calculate percentages and create chart data
        const totalRepairs = repairs.length;
        const formattedData = data.map(category => ({
          name: category.name,
          value: Math.round((categoryCounts[category.id] || 0) / totalRepairs * 100)
        })).filter(item => item.value > 0); // Only include categories with repairs

        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching repair distribution:', error);
        setChartData([]);
      }
    };

    fetchServiceDistribution();
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-gray-500">ไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
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
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceDistributionChart;