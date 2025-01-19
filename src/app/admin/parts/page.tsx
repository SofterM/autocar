'use client'

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Menu,
  Bell,
  Settings} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { PartsTable } from '@/components/parts/PartsTable';
import { AddPartModal } from '@/components/parts/AddPartModal';
import { EditPartModal } from '@/components/parts/EditPartModal';
import { CategoryModal } from '@/components/parts/CategoryModal';
import { Part } from '@/types/parts';

const PartsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'all'
  });

  useEffect(() => {
    fetchParts();
  }, [filters]);

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams();
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.status !== 'all') searchParams.set('status', filters.status);

      const response = await fetch(`/api/parts?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch parts');
      
      const data = await response.json();
      setParts(data);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const totalValue = parts.reduce((sum, part) => sum + (part.price * part.stock_quantity), 0);
  const totalItems = parts.reduce((sum, part) => sum + part.stock_quantity, 0);
  const lowStockItems = parts.filter(part => part.stock_quantity <= part.minimum_quantity).length;
  const uniqueCategories = [...new Set(parts.map(part => part.category_name))].length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isSidebarOpen={isSidebarOpen} activeMenu="คลังอะไหล่" />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">คลังอะไหล่</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {parts.length} รายการ
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell className="h-5 w-5 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-600">มูลค่าคงเหลือ</h3>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +2.5%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ฿{totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-600">จำนวนชิ้นทั้งหมด</h3>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +{uniqueCategories} หมวดหมู่
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {totalItems.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-600">สินค้าใกล้หมด</h3>
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                    {lowStockItems} รายการ
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{lowStockItems}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-600">หมวดหมู่</h3>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    ทั้งหมด
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{uniqueCategories}</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยรหัส, ชื่อ, หรือหมวดหมู่..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                  </select>
                  <button 
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    <Settings className="h-4 w-4" />
                    จัดการหมวดหมู่
                  </button>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="h-5 w-5" />
                  เพิ่มอะไหล่
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Download className="h-4 w-4" />
                  ส่งออก
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Upload className="h-4 w-4" />
                  นำเข้า
                </button>
              </div>
            </div>

            {/* Parts Table */}
            <div className="bg-white rounded-xl border border-slate-200">
              <PartsTable 
                parts={parts} 
                isLoading={isLoading}
                onUpdate={fetchParts}
                onEdit={setEditingPart}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddPartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchParts}
      />

      {editingPart && (
        <EditPartModal 
          isOpen={!!editingPart}
          part={editingPart}
          onClose={() => setEditingPart(null)}
          onSuccess={() => {
            fetchParts();
            setEditingPart(null);
          }}
        />
      )}

      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

export default PartsPage;