// app/admin/employees/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Search, Menu } from 'lucide-react';
import { User, Technician } from '@/types';
import AddTechnicianModal from '@/components/AddTechnicianModal';
import Sidebar from '@/components/admin/Sidebar';

export default function EmployeesPage() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchTechnicians();
        fetchUsers();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const response = await fetch('/api/technicians');
            if (response.ok) {
                const data = await response.json();
                setTechnicians(data);
            }
        } catch (error) {
            console.error('Error fetching technicians:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users?role=staff');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const filteredTechnicians = technicians.filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                activeMenu="จัดการพนักงาน" 
            />
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Menu className="h-5 w-5 text-gray-700" />
                                </button>
                                <h1 className="text-lg font-bold text-gray-900">จัดการพนักงาน</h1>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                เพิ่มช่างซ่อม
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาช่างซ่อม..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-gray-900"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ช่างซ่อม
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ตำแหน่ง
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            อีเมล
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            เบอร์โทร
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTechnicians.map((technician, index) => (
                                        <tr key={`${technician.id}-${technician.user_id}-${index}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {technician.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {technician.position}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(technician as any).email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(technician as any).phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                                                    technician.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {technician.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    แก้ไข
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTechnicians.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                ไม่พบข้อมูลช่างซ่อม
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <AddTechnicianModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchTechnicians();
                    }}
                    users={users}
                />
            </div>
        </div>
    );
}
