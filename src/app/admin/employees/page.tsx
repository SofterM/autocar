'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Search, Menu, Mail, Phone } from 'lucide-react';
import { User, Technician } from '@/types';
import AddTechnicianModal from '@/components/AddTechnicianModal';
import EditTechnicianModal from '@/components/EditTechnicianModal';
import Sidebar from '@/components/admin/Sidebar';

export default function EmployeesPage() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    const handleEditClick = (technician: Technician) => {
        setSelectedTechnician(technician);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setSelectedTechnician(null);
        fetchTechnicians();
    };

    const filteredTechnicians = technicians.filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mobile card component
    const TechnicianCard = ({ technician }: { technician: Technician }) => (
        <div className="bg-white p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-medium text-gray-900">{technician.name}</h3>
                    <p className="text-sm text-gray-500">{technician.position}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                    technician.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {technician.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                </span>
            </div>
            
            <div className="space-y-1 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {(technician as any).email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {(technician as any).phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">฿</span>
                    {technician.salary?.toLocaleString('th-TH')}
                </div>
            </div>
            
            <div className="flex justify-end">
                <button 
                    onClick={() => handleEditClick(technician)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                    แก้ไข
                </button>
            </div>
        </div>
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center sm:justify-start"
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
                            <div className="w-full max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาช่างซ่อม"
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-gray-900"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Desktop view */}
                        <div className="hidden md:block overflow-x-auto">
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
                                            เงินเดือน
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
                                                <div className="text-sm text-gray-900">
                                                    {technician.salary?.toLocaleString('th-TH', {
                                                        style: 'currency',
                                                        currency: 'THB'
                                                    })}
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
                                                <button 
                                                    onClick={() => handleEditClick(technician)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    แก้ไข
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view */}
                        <div className="md:hidden">
                            {filteredTechnicians.map((technician, index) => (
                                <TechnicianCard 
                                    key={`${technician.id}-${technician.user_id}-${index}`} 
                                    technician={technician} 
                                />
                            ))}
                        </div>

                        {/* Empty state */}
                        {filteredTechnicians.length === 0 && (
                            <div className="px-6 py-8 text-center text-gray-500">
                                <p>ไม่พบข้อมูลช่างซ่อม</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Modals */}
                <AddTechnicianModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchTechnicians();
                    }}
                    users={users}
                />
                <EditTechnicianModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedTechnician(null);
                    }}
                    onSuccess={handleEditSuccess}
                    technician={selectedTechnician}
                />
            </div>
        </div>
    );
}
