// components/AddTechnicianModal.tsx
'use client'

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UserResponse } from '@/types/user'; // เปลี่ยนการ import type

interface AddTechnicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    users: UserResponse[]; // เปลี่ยนเป็น UserResponse
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
        position: '',
        salary: '' // เพิ่มฟิลด์ salary
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/technicians', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: formData.userId,
                    name: formData.name,
                    position: formData.position,
                    salary: parseFloat(formData.salary) // แปลงเป็น number
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Something went wrong');
            }

            onSuccess();
            setFormData({
                userId: '',
                name: '',
                position: '',
                salary: ''
            });
        } catch (error) {
            console.error('Error creating technician:', error);
            alert('Failed to create technician. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4">
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
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
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
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
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
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
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

                                {/* เพิ่มฟิลด์เงินเดือน */}
                                <div>
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
                                        เงินเดือน
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="100"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                                    >
                                        {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTechnicianModal;
