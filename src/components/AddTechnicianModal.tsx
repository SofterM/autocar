// components/AddTechnicianModal.tsx
'use client'

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '@/types';

interface AddTechnicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    users: User[];
}

const AddTechnicianModal: React.FC<AddTechnicianModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    users
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        position: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/technicians', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create technician');
            }

            onSuccess();
        } catch (error) {
            console.error('Error creating technician:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">เพิ่มช่างซ่อม</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                เลือกพนักงาน
                            </label>
                            <select
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                value={formData.userId}
                                onChange={(e) => {
                                    const user = users.find(u => u.id === parseInt(e.target.value));
                                    setFormData({
                                        ...formData,
                                        userId: e.target.value,
                                        name: user ? `${user.first_name} ${user.last_name}` : ''
                                    });
                                }}
                            >
                                <option value="">เลือกพนักงาน</option>
                                {users.filter(user => user.role === 'staff').map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                ชื่อช่าง
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="ชื่อที่ใช้แสดง"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                ตำแหน่ง
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                placeholder="ช่างยนต์, ช่างไฟฟ้า, ..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
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

export default AddTechnicianModal;