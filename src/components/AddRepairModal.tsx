'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Technician {
    id: number;
    name: string;
    position: string;
}

interface AddRepairModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddRepairModal: React.FC<AddRepairModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);
    const [animateIn, setAnimateIn] = useState(false);
    
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        licensePlate: '',
        color: '',
        mileage: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: '',
        description: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        technicianId: '',
        estimatedCost: '',
        category: 'engine_repair'
    });

    const categories = [
        { id: 'engine_repair', name: 'ซ่อมเครื่องยนต์' },
        { id: 'parts_replacement', name: 'เปลี่ยนอะไหล่' },
        { id: 'maintenance', name: 'ตรวจเช็คระยะ' },
        { id: 'electrical_repair', name: 'ซ่อมระบบไฟฟ้า' },
        { id: 'others', name: 'อื่นๆ' }
    ];

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            document.body.style.overflow = 'unset';
            setAnimateIn(false);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOutsideClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleClose();
        }
    };

    const handleClose = () => {
        setAnimateIn(false);
        setTimeout(onClose, 300); // Wait for animation to complete
    };

    const fetchTechnicians = async () => {
        try {
            const response = await fetch('/api/technicians/active');
            if (!response.ok) {
                throw new Error('Failed to fetch technicians');
            }
            const data = await response.json();
            setTechnicians(data);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/repairs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    technicianId: formData.technicianId || null,
                    mileage: parseInt(formData.mileage),
                    estimatedCost: parseFloat(formData.estimatedCost)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create repair');
            }

            const data = await response.json();
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error creating repair:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
            aria-labelledby="modal-title" 
            role="dialog" 
            aria-modal="true"
            onClick={handleOutsideClick}
        >
            <div 
                className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${animateIn ? 'bg-opacity-60' : 'bg-opacity-0'}`}
                aria-hidden="true"
            ></div>

            <div 
                ref={modalRef}
                className={`relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 transition-all duration-300 ease-in-out ${
                    animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></span>
                        สร้างงานซ่อมใหม่
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-150px)] overflow-y-auto">
                    {/* Customer Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-indigo-600 uppercase tracking-wider flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                <span className="text-indigo-600 font-bold">1</span>
                            </div>
                            ข้อมูลลูกค้า
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ชื่อลูกค้า <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="ชื่อ-นามสกุล"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    placeholder="0812345678"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-indigo-600 uppercase tracking-wider flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                <span className="text-indigo-600 font-bold">2</span>
                            </div>
                            ข้อมูลรถ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ยี่ห้อรถ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Toyota, Honda, ..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รุ่น <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="Camry, Civic, ..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    เลขทะเบียน <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.licensePlate}
                                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                    placeholder="กข 1234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    สี
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="สีขาว, สีดำ, ..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    เลขไมล์ (กม.) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.mileage}
                                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ประมาณการค่าซ่อม (บาท) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.estimatedCost}
                                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Repair Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-indigo-600 uppercase tracking-wider flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                <span className="text-indigo-600 font-bold">3</span>
                            </div>
                            ข้อมูลการซ่อม
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    วันที่รับรถ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    กำหนดวันเสร็จ
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.expectedEndDate}
                                    onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    หมวดหมู่งานซ่อม <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-white"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ช่างผู้รับผิดชอบ
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-white"
                                    value={formData.technicianId}
                                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                                >
                                    <option value="">เลือกช่างซ่อม</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name} - {tech.position}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รายละเอียดงานซ่อม
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="รายละเอียดการซ่อม อาการเสีย..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    กำลังบันทึก...
                                </span>
                            ) : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};