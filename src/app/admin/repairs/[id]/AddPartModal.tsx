// src/app/admin/repairs/[id]/AddPartModal.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface Part {
    id: string;
    code: string;
    name: string;
    category_name: string;
    selling_price: number;
    stock_quantity: number;
}

interface AddPartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { partId: string; quantity: number }) => void;
}

export const AddPartModal: React.FC<AddPartModalProps> = ({
    isOpen,
    onClose,
    onAdd
}) => {
    const [parts, setParts] = useState<Part[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [quantity, setQuantity] = useState('1');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchParts();
        }
    }, [isOpen, search, category]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/parts/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchParts = async () => {
        try {
            setIsLoading(true);
            const searchParams = new URLSearchParams();
            if (search) searchParams.set('search', search);
            if (category) searchParams.set('category', category);
            
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPart) return;

        onAdd({
            partId: selectedPart.id,
            quantity: parseInt(quantity)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

                <div className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">เพิ่มอะไหล่</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาอะไหล่..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg"
                                />
                            </div>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg min-w-[200px]"
                            >
                                <option value="">หมวดหมู่ทั้งหมด</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Parts List */}
                        <div className="border rounded-lg overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ราคา</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">คงเหลือ</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {parts.map((part) => (
                                        <tr 
                                            key={part.id}
                                            className={`hover:bg-gray-50 ${selectedPart?.id === part.id ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900">{part.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{part.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{part.category_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                                ฿{part.selling_price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                                {part.stock_quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedPart(part)}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                                        selectedPart?.id === part.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-blue-600 hover:text-blue-800'
                                                    }`}
                                                >
                                                    เลือก
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {parts.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                ไม่พบข้อมูลอะไหล่
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Selected Part */}
                        {selectedPart && (
                            <form onSubmit={handleSubmit}>
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            อะไหล่ที่เลือก
                                        </label>
                                        <div className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                                            {selectedPart.name}
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            จำนวน
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedPart.stock_quantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        เพิ่มอะไหล่
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};