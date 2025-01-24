'use client'

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Menu,
    Bell,
    Filter,
    Calendar,
    CheckCircle,
    Clock
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';

interface Appointment {
    id: number;
    user_id: number;
    service: string;
    repair_details: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    user: {
        firstName: string;
        lastName: string;
        phone: string;
    };
}

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all'
    });

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
        fetchAppointments();
    }, [filters]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const searchParams = new URLSearchParams();
            if (filters.search) searchParams.set('search', filters.search);
            if (filters.status !== 'all') searchParams.set('status', filters.status);

            const response = await fetch(`/api/appointments?${searchParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const data = await response.json();
            setAppointments(data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const statistics = [
        {
            title: 'การจองทั้งหมด',
            value: appointments.length || 0,
            subtitle: 'การจองในระบบ',
            icon: Calendar,
            color: 'bg-blue-500'
        },
        {
            title: 'รอดำเนินการ',
            value: appointments.filter(a => a.status === 'pending').length || 0,
            subtitle: 'การจองที่รอยืนยัน',
            icon: Clock,
            color: 'bg-amber-500'
        },
        {
            title: 'เสร็จสิ้น',
            value: appointments.filter(a => a.status === 'completed').length || 0,
            subtitle: 'การจองที่เสร็จสิ้น',
            icon: CheckCircle,
            color: 'bg-emerald-500'
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                activeMenu="จัดการการจอง" 
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
                                <h1 className="text-lg lg:text-xl font-bold text-gray-900">การจอง</h1>
                                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {appointments.length || 0} รายการ
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {statistics.map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
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

                    <div className={`space-y-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                        isFiltersVisible ? 'block' : 'hidden lg:block'
                    }`}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาด้วยชื่อ, เบอร์โทร..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">สถานะทั้งหมด</option>
                                    <option value="pending">รอดำเนินการ</option>
                                    <option value="confirmed">ยืนยันแล้ว</option>
                                    <option value="completed">เสร็จสิ้น</option>
                                    <option value="cancelled">ยกเลิก</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Appointments Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้จอง</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บริการ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.user.firstName} {appointment.user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{appointment.user.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{appointment.service}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{appointment.appointment_date}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{appointment.appointment_time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {/* Add action buttons here */}
                                                <button className="text-blue-600 hover:text-blue-900">จัดการ</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}