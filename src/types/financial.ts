// src/types/financial.ts
export interface MonthlyData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }
  
  export interface ServiceData {
    name: string;
    value: number;
  }
  
  export interface Transaction {
    service: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
  }
  
  export interface Statistic {
    title: string;
    value: string;
    trend: string;
    isUp: boolean;
    icon: any;
    color: string;
  }