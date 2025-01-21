// src/components/financial/StatisticCard.tsx
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatisticCardProps {
  title: string;
  value: string;
  trend: string;
  isUp: boolean;
  icon: any;
  color: string;
}

export const StatisticCard = ({ title, value, trend, isUp, icon: Icon, color }: StatisticCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`p-3 rounded-xl ${color} text-white`}>
            <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
          </span>
          <span className={`flex items-center gap-1 text-sm font-semibold ${
            isUp ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {trend}
            {isUp ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};