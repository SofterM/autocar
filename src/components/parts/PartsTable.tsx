// src/components/parts/PartsTable.tsx
'use client'

import React from 'react';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Part } from '@/types/parts';

interface PartsTableProps {
  parts: Part[];
  isLoading: boolean;
  onUpdate: () => void;
  onEdit: (part: Part) => void;
}

export const PartsTable: React.FC<PartsTableProps> = ({
  parts,
  isLoading,
  onUpdate,
  onEdit
}) => {
  const handleDelete = async (id: number) => {
    if (confirm('คุณต้องการลบอะไหล่นี้ใช่หรือไม่?')) {
      try {
        const response = await fetch(`/api/parts/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete part');
        }

        onUpdate();
      } catch (error) {
        console.error('Error deleting part:', error);
        alert('เกิดข้อผิดพลาดในการลบอะไหล่');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">รหัส</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">ชื่ออะไหล่</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">หมวดหมู่</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">ราคาขาย</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">ต้นทุน</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">คงเหลือ</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600">สถานะ</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {parts.map((part) => (
            <tr key={part.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{part.code}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{part.name}</span>
                  {part.brand && (
                    <span className="text-xs text-slate-500">{part.brand}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600">{part.category_name}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-medium text-slate-900">
                  ฿{part.price.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm text-slate-600">
                  ฿{part.cost.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  {part.stock_quantity <= part.minimum_quantity && (
                    <span 
                      className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs"
                      title="สินค้าใกล้หมด"
                    >
                      <AlertCircle className="h-3 w-3" />
                      สินค้าใกล้หมด
                    </span>
                  )}
                  <span className={`text-sm font-medium ${
                    part.stock_quantity <= part.minimum_quantity 
                      ? 'text-amber-600' 
                      : 'text-slate-900'
                  }`}>
                    {part.stock_quantity.toLocaleString()}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  {part.status === 'active' ? (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                      ใช้งาน
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      ไม่ใช้งาน
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => onEdit(part)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit2 className="h-4 w-4 text-slate-500" />
                  </button>
                  <button 
                    onClick={() => handleDelete(part.id)}
                    className="p-1 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {parts.length === 0 && (
        <div className="py-12">
          <div className="text-center">
            <p className="text-sm text-slate-500">ไม่พบข้อมูลอะไหล่</p>
          </div>
        </div>
      )}
    </div>
  );
};