// src/components/financial/FinancialSummaryTable.tsx
import { MonthlyData } from '@/types/financial';

interface FinancialSummaryTableProps {
  data: MonthlyData[];
}

export const FinancialSummaryTable = ({ data }: FinancialSummaryTableProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(value);
  };

  return (
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
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{item.month}</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {formatCurrency(item.revenue)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {formatCurrency(item.expenses)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {formatCurrency(item.profit)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {((item.profit / item.revenue) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="py-3 px-4 text-sm font-semibold text-gray-900">รวม</td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                {(data.reduce((sum, item) => sum + item.profit, 0) / 
                  data.reduce((sum, item) => sum + item.revenue, 0) * 100).toFixed(1)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};