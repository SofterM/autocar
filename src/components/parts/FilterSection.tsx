// components/parts/FilterSection.tsx
import React from 'react';
import { X } from 'lucide-react';

interface FilterSectionProps {
  filters: {
    search: string;
    category: string;
    status: string;
  };
  setFilters: (filters: { search: string; category: string; status: string }) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ filters, setFilters }) => {
  const clearFilter = (key: string) => {
    setFilters({ ...filters, [key]: '' });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.search && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-sm">
          <span>ค้นหา: {filters.search}</span>
          <button
            onClick={() => clearFilter('search')}
            className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {filters.category && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-sm">
          <span>หมวดหมู่: {filters.category}</span>
          <button
            onClick={() => clearFilter('category')}
            className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {filters.status !== 'all' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-sm">
          <span>สถานะ: {filters.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}</span>
          <button
            onClick={() => setFilters({ ...filters, status: 'all' })}
            className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
};