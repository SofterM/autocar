'use client'

import React, { useState, useEffect } from 'react';
import { Search, Menu, Bell, Filter, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import ManageAppointmentModal from '@/components/AppointmentModal';
import { Appointment } from '@/types/appointment';

interface Statistics {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ElementType;
    color: string;
}

interface Filters {
    search: string;
    status: string;
}

const INITIAL_FILTERS: Filters = {
    search: '',
    status: 'all'
};

const STATUS_STYLES = {
    pending: { class: 'bg-yellow-100 text-yellow-800', text: 'รอดำเนินการ' },
    confirmed: { class: 'bg-blue-100 text-blue-800', text: 'ยืนยันแล้ว' },
    cancelled: { class: 'bg-red-100 text-red-800', text: 'ยกเลิก' }
};

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

    useEffect(() => {
        const handleResize = () => {
            const isLargeScreen = window.innerWidth >= 1024;
            setIsSidebarOpen(isLargeScreen);
            setIsFiltersVisible(isLargeScreen);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [filters]);

    const statistics: Record<string, Statistics> = {
        total: {
            title: 'การจองทั้งหมด',
            value: appointments.length,
            subtitle: 'การจองในระบบ',
            icon: Calendar,
            color: 'bg-blue-500'
        },
        pending: {
            title: 'รอดำเนินการ',
            value: appointments.filter(a => a.status === 'pending').length,
            subtitle: 'การจองที่รอยืนยัน',
            icon: Clock,
            color: 'bg-amber-500'
        },
        confirmed: {
            title: 'ยืนยันแล้ว',
            value: appointments.filter(a => a.status === 'confirmed').length,
            subtitle: 'การจองที่ยืนยันแล้ว',
            icon: CheckCircle,
            color: 'bg-emerald-500'
        },
        cancelled: {
            title: 'ยกเลิกแล้ว',
            value: appointments.filter(a => a.status === 'cancelled').length,
            subtitle: 'การจองที่ถูกยกเลิก',
            icon: XCircle,
            color: 'bg-red-500'
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            timeZone: 'Asia/Bangkok'
        });
    };

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/appointments');
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const data = await response.json();
            
            let filteredData = data as Appointment[];
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredData = data.filter((appointment: Appointment) => {
                    const fullName = `${appointment.user?.firstName ?? ''} ${appointment.user?.lastName ?? ''}`.toLowerCase();
                    const phone = appointment.user?.phone ?? '';
                    return fullName.includes(searchLower) || phone.includes(filters.search);
                });
            }
            if (filters.status !== 'all') {
                filteredData = filteredData.filter((appointment: Appointment) => 
                    appointment.status === filters.status
                );
            }
            
            setAppointments(filteredData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const response = await fetch(`/api/appointments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Failed to update appointment status');
            }

            await fetchAppointments(); // Refresh the appointments list
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusStyle = (status: string) => {
        return STATUS_STYLES[status as keyof typeof STATUS_STYLES]?.class ?? 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        return STATUS_STYLES[status as keyof typeof STATUS_STYLES]?.text ?? status;
    };

    // Mobile Card View Component
    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-gray-900">
                        {appointment.user?.firstName ?? 'ไม่ระบุ'} {appointment.user?.lastName ?? ''}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.user?.phone ?? 'ไม่ระบุเบอร์โทร'}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                </span>
            </div>
            <div>
                <p className="text-sm text-gray-900">{appointment.service}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.repair_details}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                    <p>{formatDate(appointment.appointment_date)}</p>
                    <p>{appointment.appointment_time}</p>
                </div>
                <button 
                    onClick={() => setSelectedAppointment(appointment)}
                    className="text-blue-600 hover:text-blue-900"
                >
                    จัดการ
                </button>
            </div>
        </div>
    );

    const renderStatistics = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(statistics).map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className={`p-3 rounded-xl ${stat.color} text-white`}>
                            <stat.icon className="h-5 w-5" />
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
    );

    const renderFilters = () => (
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
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">สถานะทั้งหมด ({appointments.length})</option>
                        {Object.entries(STATUS_STYLES).map(([status, { text }]) => (
                            <option key={status} value={status}>
                                {text} ({appointments.filter(a => a.status === status).length})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderAppointments = () => (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้จอง</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">บริการ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {appointment.user?.firstName ?? 'ไม่ระบุ'} {appointment.user?.lastName ?? ''}
                                            </div>
                                            <div className="text-sm text-gray-500">{appointment.user?.phone ?? 'ไม่ระบุเบอร์โทร'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{appointment.service}</div>
                                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.repair_details}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(appointment.appointment_date)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{appointment.appointment_time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(appointment.status)}`}>
                                                {getStatusText(appointment.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                                onClick={() => setSelectedAppointment(appointment)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                จัดการ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
            </div>
        </div>
    );

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
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                            >
                                <Menu className="h-5 w-5 text-gray-700" />
                            </button>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg lg:text-xl font-bold text-gray-900">การจอง</h1>
                                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {appointments.length} รายการ
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
                    {renderStatistics()}
                    {renderFilters()}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">ไม่พบข้อมูลการจอง</p>
                        </div>
                    ) : (
                        renderAppointments()
                    )}
                </main>
            </div>

            {selectedAppointment && (
                <ManageAppointmentModal 
                    isOpen={!!selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    appointment={selectedAppointment}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={() => console.log('Delete appointment')}
                />
            )}
        </div>
    );
}