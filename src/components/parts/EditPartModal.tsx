// src/components/parts/EditPartModal.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Part, Category } from '@/types/parts';

interface EditPartModalProps {
  isOpen: boolean;
  part: Part;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPartModal: React.FC<EditPartModalProps> = ({
  isOpen,
  part,
  onClose,
  onSuccess
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    description: '',
    price: '',
    cost: '',
    stock_quantity: '',
    minimum_quantity: '',
    location: '',
    brand: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (part) {
      setFormData({
        code: part.code,
        name: part.name,
        category_id: part.category_id.toString(),
        description: part.description || '',
        price: part.price.toString(),
        cost: part.cost.toString(),
        stock_quantity: part.stock_quantity.toString(),
        minimum_quantity: part.minimum_quantity.toString(),
        location: part.location || '',
        brand: part.brand || '',
        status: part.status
      });
    }
  }, [part]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/parts/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/parts/${part.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          stock_quantity: parseInt(formData.stock_quantity),
          minimum_quantity: parseInt(formData.minimum_quantity),
          category_id: parseInt(formData.category_id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update part');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating part:', error);
      setError('เกิดข้อผิดพลาดในการแก้ไขอะไหล่');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">แก้ไขข้อมูลอะไหล่</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* รหัสอะไหล่ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  รหัสอะไหล่
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ชื่ออะไหล่ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  ชื่ออะไหล่
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* หมวดหมู่ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  หมวดหมู่
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ยี่ห้อ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  ยี่ห้อ
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ราคาขาย */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  ราคาขาย
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ต้นทุน */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  ต้นทุน
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* จำนวนคงเหลือ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  จำนวนคงเหลือ
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* จำนวนขั้นต่ำ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  จำนวนขั้นต่ำ
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.minimum_quantity}
                  onChange={(e) => setFormData({ ...formData, minimum_quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ตำแหน่งจัดเก็บ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  ตำแหน่งจัดเก็บ
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* สถานะ */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  สถานะ
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                รายละเอียด
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};