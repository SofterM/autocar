// src/components/financial/RecentTransactions.tsx
interface Transaction {
    service: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
  }
  
  interface RecentTransactionsProps {
    transactions: Transaction[];
  }
  
  export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">รายการล่าสุด</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ดูทั้งหมด
            </button>
          </div>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
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
    );
  };
  