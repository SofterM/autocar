'use client'

import React from 'react';
import { Edit2, Trash2, AlertCircle, Package } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mobile Card View
  const MobileCard = ({ part }: { part: Part }) => (
    <div className="bg-white p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{part.code}</span>
            {part.status === 'active' ? (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                ใช้งาน
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                ไม่ใช้งาน
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 truncate">{part.name}</h3>
          {part.brand && (
            <p className="text-xs text-gray-500 mt-0.5">{part.brand}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              {part.category_name}
            </span>
            <span>ต้นทุน: ฿{part.cost.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-semibold text-gray-900">
            ฿{part.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            {part.stock_quantity <= part.minimum_quantity && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs">
                <AlertCircle className="h-3 w-3" />
                สินค้าใกล้หมด
              </span>
            )}
            <span className={`text-sm font-medium ${
              part.stock_quantity <= part.minimum_quantity 
                ? 'text-amber-600' 
                : 'text-gray-900'
            }`}>
              {part.stock_quantity.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button 
          onClick={() => onEdit(part)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="แก้ไข"
        >
          <Edit2 className="h-4 w-4 text-gray-500" />
        </button>
        <button 
          onClick={() => handleDelete(part.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="ลบ"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">รหัส</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ชื่ออะไหล่</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">หมวดหมู่</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">ราคาขาย</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">ต้นทุน</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">คงเหลือ</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">สถานะ</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{part.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{part.name}</span>
                    {part.brand && (
                      <span className="text-xs text-gray-500">{part.brand}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{part.category_name}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    ฿{part.price.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-600">
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
                        : 'text-gray-900'
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
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        ไม่ใช้งาน
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(part)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleDelete(part.id)}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {parts.map((part) => (
          <MobileCard key={part.id} part={part} />
        ))}
      </div>

      {parts.length === 0 && (
        <div className="py-12">
          <div className="text-center">
            <p className="text-sm text-gray-500">ไม่พบข้อมูลอะไหล่</p>
          </div>
        </div>
      )}
    </div>
  );
};