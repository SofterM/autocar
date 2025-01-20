'use client'

import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/parts/categories');
      const data = await response.json();
      setCategories(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory 
        ? `/api/parts/categories/${editingCategory.id}`
        : '/api/parts/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchCategories();
        setFormData({ name: '', description: '' });
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) {
      try {
        const response = await fetch(`/api/parts/categories/${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          alert(data.error || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
          return;
        }
  
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('เกิดข้อผิดพลาดในการลบหมวดหมู่');
      }
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">จัดการหมวดหมู่อะไหล่</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ระบุชื่อหมวดหมู่"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ระบุคำอธิบายหมวดหมู่"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                </button>
              </div>
            </form>

            {/* Categories List */}
            <div className="border rounded-lg border-slate-200">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">ชื่อหมวดหมู่</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">คำอธิบาย</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{category.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{category.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(category)}
                              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4 text-slate-500" />
                            </button>
                            <button 
                              onClick={() => handleDelete(category.id)}
                              className="p-1 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};