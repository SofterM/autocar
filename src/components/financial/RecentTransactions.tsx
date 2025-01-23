'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronDown, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  repair_id: string;
  service_name: string;
  created_at: string;
  total_price: number;
  type: 'income' | 'expense';
}

interface RecentTransactionsProps {
  limit?: number;
}

export const RecentTransactions = ({ limit = 5 }: RecentTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/repairs/transactions?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center h-[300px] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">รายการล่าสุด</h3>
        <button 
          onClick={() => router.push('/admin/repairs')}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all duration-200"
        >
          ดูทั้งหมด
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50 pr-2">
        <AnimatePresence>
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group hover:shadow-md transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-indigo-100">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'income' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {transaction.type === 'income' 
                      ? <ArrowUpRight className="w-4 h-4" />
                      : <ArrowDownRight className="w-4 h-4" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">
                      {transaction.service_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: th })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.p
                    className={`text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    ฿{transaction.total_price.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};