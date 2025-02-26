'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Search, Menu, Mail, Phone, MoreVertical, Filter, ChevronDown, UserPlus, ArrowRight, Star, Clock, Users, Briefcase, XCircle } from 'lucide-react';
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
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

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

    const filteredTechnicians = technicians.filter(tech => {
        const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tech.position.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeFilter === 'all') return matchesSearch;
        if (activeFilter === 'active') return matchesSearch && tech.status === 'active';
        if (activeFilter === 'inactive') return matchesSearch && tech.status !== 'active';
        return matchesSearch;
    });

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'active'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10'
        }`}>
            <span className={`mr-1 h-1.5 w-1.5 rounded-full ${
                status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'
            }`}></span>
            {status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
        </span>
    );

    // Mobile card component
    const TechnicianCard = ({ technician }: { technician: Technician }) => (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-3 transition-all hover:shadow-md hover:border-gray-200">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{technician.name}</h3>
                        <div className="flex items-center mt-1">
                            <Briefcase className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                            <p className="text-sm text-gray-600">{technician.position}</p>
                        </div>
                    </div>
                    <StatusBadge status={technician.status} />
                </div>
                
                <div className="space-y-3 mb-5">
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                        <span className="text-gray-700">{(technician as any).email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Phone className="h-4 w-4 mr-2 text-indigo-400" />
                        <span className="text-gray-700">{(technician as any).phone}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium bg-indigo-50 p-2 rounded-lg">
                        <Star className="h-4 w-4 mr-2 text-indigo-500" />
                        <span className="text-indigo-700">{technician.salary?.toLocaleString('th-TH')} บาท</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => handleEditClick(technician)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    แก้ไขข้อมูล
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
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
                                เพิ่มพนักงาน
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                <div className="w-full sm:max-w-xs">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                        <input
                                            type="text"
                                            placeholder="ค้นหาช่างซ่อม..."
                                            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    <button 
                                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                    >
                                        <Filter className="h-4 w-4 text-indigo-500" />
                                        {activeFilter === 'all' && 'แสดงทั้งหมด'}
                                        {activeFilter === 'active' && 'กำลังใช้งาน'}
                                        {activeFilter === 'inactive' && 'ไม่ได้ใช้งาน'}
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </button>
                                    
                                    {isFilterDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <button
                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${activeFilter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-700`}
                                                    onClick={() => {
                                                        setActiveFilter('all');
                                                        setIsFilterDropdownOpen(false);
                                                    }}
                                                >
                                                    <Users className="h-4 w-4" />
                                                    แสดงทั้งหมด
                                                </button>
                                                <button
                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${activeFilter === 'active' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-700`}
                                                    onClick={() => {
                                                        setActiveFilter('active');
                                                        setIsFilterDropdownOpen(false);
                                                    }}
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    กำลังใช้งาน
                                                </button>
                                                <button
                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${activeFilter === 'inactive' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-700`}
                                                    onClick={() => {
                                                        setActiveFilter('inactive');
                                                        setIsFilterDropdownOpen(false);
                                                    }}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    ไม่ได้ใช้งาน
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop view */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    พนักงาน
                                                </th>
                                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ตำแหน่ง
                                                </th>
                                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    อีเมล
                                                </th>
                                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    เบอร์โทร
                                                </th>
                                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    เงินเดือน
                                                </th>
                                                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    สถานะ
                                                </th>
                                                <th scope="col" className="relative px-6 py-3.5">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTechnicians.map((technician, index) => (
                                                <tr key={`${technician.id}-${technician.user_id}-${index}`} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {technician.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600 flex items-center">
                                                            <Briefcase className="h-4 w-4 mr-2 text-indigo-400" />
                                                            {technician.position}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600 flex items-center">
                                                            <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                                                            {(technician as any).email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600 flex items-center">
                                                            <Phone className="h-4 w-4 mr-2 text-indigo-400" />
                                                            {(technician as any).phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg inline-flex items-center">
                                                            <Star className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                                                            {technician.salary?.toLocaleString('th-TH', {
                                                                style: 'currency',
                                                                currency: 'THB'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <StatusBadge status={technician.status} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button 
                                                            onClick={() => handleEditClick(technician)}
                                                            className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
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
                                <div className="md:hidden p-4 grid gap-4 sm:grid-cols-2">
                                    {filteredTechnicians.map((technician, index) => (
                                        <TechnicianCard 
                                            key={`${technician.id}-${technician.user_id}-${index}`} 
                                            technician={technician} 
                                        />
                                    ))}
                                </div>

                                {/* Empty state */}
                                {filteredTechnicians.length === 0 && (
                                    <div className="py-16 px-6 text-center">
                                        <div className="mx-auto h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                                            <Search className="h-12 w-12 text-indigo-400" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">ไม่พบข้อมูลช่างซ่อม</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">ลองเปลี่ยนตัวกรองหรือคำค้นหาของคุณ หรือเพิ่มช่างซ่อมใหม่</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setActiveFilter('all');
                                                }}
                                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                ล้างตัวกรอง
                                            </button>
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <UserPlus className="h-4 w-4 mr-1.5" />
                                                เพิ่มพนักงาน
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
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
                    } } users={[]}              
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