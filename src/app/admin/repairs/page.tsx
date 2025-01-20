// src/app/admin/repairs/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // เพิ่ม import useRouter
import {
    Search,
    Plus,
    Menu,
    Bell,
    Filter,
    Wrench,
    CircleDollarSign,
    Clock} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { AddRepairModal } from '@/components/AddRepairModal';

interface Repair {
    id: string;
    brand: string;
    model: string;
    license_plate: string;
    mileage: number;
    start_date: string;
    expected_end_date: string | null;
    actual_end_date: string | null;
    status: string;
    estimated_cost: number;
    final_cost: number | null;
    description: string;
    customer: {
        id: string;
        name: string;
        email: string | null;
        phone: string;
    };
    technician: {
        id: string;
        name: string;
        position: string;
    } | null;
}

export default function RepairsPage() {
    const router = useRouter();
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all'
    });
    const handleViewDetail = (repairId: string) => {
        router.push(`/admin/repairs/${repairId}`);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
                setIsFiltersVisible(true);
            } else {
                setIsSidebarOpen(false);
                setIsFiltersVisible(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchRepairs();
    }, [filters]);

    const fetchRepairs = async () => {
        try {
            setIsLoading(true);
            const searchParams = new URLSearchParams();
            if (filters.search) searchParams.set('search', filters.search);
            if (filters.status !== 'all') searchParams.set('status', filters.status);

            const response = await fetch(`/api/repairs?${searchParams.toString()}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch repairs');
            }
            const data = await response.json();
            console.log('Fetched repairs:', data);
            setRepairs(data || []);
        } catch (error) {
            console.error('Error fetching repairs:', error);
            setRepairs([]);
        } finally {
            setIsLoading(false);
        }
    };

    // คำนวณสถิติ
    const totalRepairs = repairs.length;
    const pendingRepairs = repairs.filter(r => r.status === 'pending').length;
    const inProgressRepairs = repairs.filter(r => r.status === 'in_progress').length;
    const totalRevenue = repairs
        .filter(r => r.status === 'completed')
        .reduce((sum, repair) => sum + (repair.final_cost || 0), 0);

    const statistics = [
        {
            title: 'งานซ่อมทั้งหมด',
            value: totalRepairs,
            subtitle: 'งานในระบบ',
            icon: Wrench,
            color: 'bg-blue-500'
        },
        {
            title: 'รอดำเนินการ',
            value: pendingRepairs,
            subtitle: 'งานที่ยังไม่เริ่ม',
            icon: Clock,
            color: 'bg-amber-500'
        },
        {
            title: 'กำลังดำเนินการ',
            value: inProgressRepairs,
            subtitle: 'งานที่กำลังซ่อม',
            icon: Wrench,
            color: 'bg-indigo-500'
        },
        {
            title: 'รายได้รวม',
            value: `฿${totalRevenue.toLocaleString()}`,
            subtitle: 'รายได้จากงานที่เสร็จสิ้น',
            icon: CircleDollarSign,
            color: 'bg-emerald-500'
        }
    ];

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return 'border border-amber-200 bg-amber-50 text-amber-700';
            case 'in_progress':
                return 'border border-blue-200 bg-blue-50 text-blue-700';
            case 'completed':
                return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'cancelled':
                return 'border border-red-200 bg-red-50 text-red-700';
            default:
                return 'border border-gray-200 bg-gray-50 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'รอดำเนินการ';
            case 'in_progress':
                return 'กำลังซ่อม';
            case 'completed':
                return 'เสร็จสิ้น';
            case 'cancelled':
                return 'ยกเลิก';
            default:
                return status;
        }
    };

    const formatPhoneNumber = (phone: string | null) => {
        if (!phone) return '-';
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                activeMenu="จัดการงานซ่อม" 
            />
            
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="h-5 w-5 text-gray-700" />
                            </button>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg lg:text-xl font-bold text-gray-900">งานซ่อม</h1>
                                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {repairs.length} รายการ
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                                <Bell className="h-5 w-5 text-gray-700" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button
                                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                            >
                                <Filter className="h-5 w-5 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-6 space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statistics.map((stat, index) => (
                            <div key={`stat-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <span className={`p-3 rounded-xl ${stat.color} text-white`}>
                                        <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    <p className="text-sm text-gray-600 mt-1">{stat.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className={`space-y-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                        isFiltersVisible ? 'block' : 'hidden lg:block'
                    }`}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาด้วยเลขทะเบียน, ลูกค้า..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">สถานะทั้งหมด</option>
                                    <option value="pending">รอดำเนินการ</option>
                                    <option value="in_progress">กำลังซ่อม</option>
                                    <option value="completed">เสร็จสิ้น</option>
                                    <option value="cancelled">ยกเลิก</option>
                                </select>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="hidden sm:inline">สร้างงานใหม่</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Repairs Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รถยนต์</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ช่างซ่อม</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่รับรถ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {repairs.map((repair) => (
                                        <tr key={repair.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {repair.brand} {repair.model}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {repair.license_plate}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {repair.customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatPhoneNumber(repair.customer.phone)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {repair.technician?.name || '-'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {repair.technician?.position || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(repair.start_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(repair.status)}`}>
                                                    {getStatusText(repair.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                <button
                                                    onClick={() => handleViewDetail(repair.id)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center gap-1"
                                                >
                                                    ดูรายละเอียด
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Empty State */}
                    {repairs.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบรายการซ่อม</h3>
                            <p className="mt-2 text-sm text-gray-500">เริ่มต้นสร้างรายการซ่อมใหม่</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    สร้างงานใหม่
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            <AddRepairModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchRepairs();
                }}
            />
        </div>
    );
}