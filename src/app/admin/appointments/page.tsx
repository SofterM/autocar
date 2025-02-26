'use client'

import React, { useState, useEffect } from 'react';
import { Search, Menu, Filter, Calendar, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import ManageAppointmentModal from '@/components/AppointmentModal';
import { Appointment } from '@/types/appointment';

interface Statistics {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
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
    pending: { 
        class: 'bg-amber-100 text-amber-800 border border-amber-300', 
        text: 'รอดำเนินการ',
        badge: 'bg-amber-500' 
    },
    confirmed: { 
        class: 'bg-emerald-100 text-emerald-800 border border-emerald-300', 
        text: 'ยืนยันแล้ว',
        badge: 'bg-emerald-500' 
    },
    cancelled: { 
        class: 'bg-red-100 text-red-800 border border-red-300', 
        text: 'ยกเลิก',
        badge: 'bg-red-500' 
    }
};

// Ensure the appointment interface meets the requirements of the modal
interface AppointmentWithRequiredUser extends Appointment {
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
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRequiredUser | null>(null);
    const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        pending: {
            title: 'รอดำเนินการ',
            value: appointments.filter(a => a.status === 'pending').length,
            subtitle: 'การจองที่รอยืนยัน',
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
        },
        confirmed: {
            title: 'ยืนยันแล้ว',
            value: appointments.filter(a => a.status === 'confirmed').length,
            subtitle: 'การจองที่ยืนยันแล้ว',
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        cancelled: {
            title: 'ยกเลิกแล้ว',
            value: appointments.filter(a => a.status === 'cancelled').length,
            subtitle: 'การจองที่ถูกยกเลิก',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
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

    const sortAppointments = (appointments: Appointment[]) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return appointments.sort((a, b) => {
            const dateA = new Date(a.appointment_date);
            const dateB = new Date(b.appointment_date);
            
            // Check if dates are in the past
            const isAPast = dateA < now;
            const isBPast = dateB < now;

            if (isAPast && !isBPast) return 1;  // A is past, B is future -> B comes first
            if (!isAPast && isBPast) return -1; // A is future, B is past -> A comes first
            
            // If both are past or both are future, sort by closest date first
            return isAPast 
                ? dateA.getTime() - dateB.getTime()  // For past dates, older goes later
                : dateA.getTime() - dateB.getTime(); // For future dates, closer date comes first
        });
    };

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            setIsRefreshing(true);
            const response = await fetch('/api/appointments');
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const data = await response.json();
            
            let filteredData = data as Appointment[];
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredData = data.filter((appointment: Appointment) => {
                    const firstName = appointment.user?.firstName ?? '';
                    const lastName = appointment.user?.lastName ?? '';
                    const fullName = `${firstName} ${lastName}`.toLowerCase();
                    const phone = appointment.user?.phone ?? '';
                    const serviceDetails = appointment.repair_details?.toLowerCase() ?? '';
                    const service = appointment.service?.toLowerCase() ?? '';
                    
                    return fullName.includes(searchLower) || 
                           phone.includes(filters.search) ||
                           serviceDetails.includes(searchLower) ||
                           service.includes(searchLower);
                });
            }
            if (filters.status !== 'all') {
                filteredData = filteredData.filter((appointment: Appointment) => 
                    appointment.status === filters.status
                );
            }
            
            // Sort the appointments
            const sortedData = sortAppointments(filteredData);
            setAppointments(sortedData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setIsRefreshing(false);
            }, 500);
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

            await fetchAppointments();
            setSelectedAppointment(null);
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

    const getStatusBadge = (status: string) => {
        return STATUS_STYLES[status as keyof typeof STATUS_STYLES]?.badge ?? 'bg-gray-500';
    };

    const handleSelectAppointment = (appointment: Appointment) => {
        // Ensure the appointment has a user object before passing it to the modal
        if (!appointment.user) {
            // Create a default user object if it's missing
            const appointmentWithUser: AppointmentWithRequiredUser = {
                ...appointment,
                user: {
                    firstName: 'ไม่ระบุ',
                    lastName: '',
                    phone: 'ไม่ระบุเบอร์โทร'
                }
            };
            setSelectedAppointment(appointmentWithUser);
        } else {
            // Cast to the required type when we know user exists
            setSelectedAppointment(appointment as AppointmentWithRequiredUser);
        }
    };

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-gray-900">
                        {appointment.user?.firstName ?? 'ไม่ระบุ'} {appointment.user?.lastName ?? ''}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.user?.phone ?? 'ไม่ระบุเบอร์โทร'}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900">{appointment.service}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.repair_details}</p>
            </div>
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{formatDate(appointment.appointment_date)}</span>
                </div>
                <button 
                    onClick={() => handleSelectAppointment(appointment)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                    จัดการ
                </button>
            </div>
        </div>
    );

    const renderStatistics = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(statistics).map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                        </div>
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
                        placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, บริการ..."
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
                    <button
                        onClick={() => fetchAppointments()}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAppointmentDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.getTime() === today.getTime()) {
            return <span className="font-medium text-blue-600">วันนี้</span>;
        } else if (date.getTime() === tomorrow.getTime()) {
            return <span className="font-medium text-purple-600">พรุ่งนี้</span>;
        }
        
        return formatDate(dateStr);
    };

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
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start space-x-3">
                                                <div className={`w-2 h-2 mt-2 rounded-full ${getStatusBadge(appointment.status)}`}></div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {appointment.user?.firstName ?? 'ไม่ระบุ'} {appointment.user?.lastName ?? ''}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{appointment.user?.phone ?? 'ไม่ระบุเบอร์โทร'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{appointment.service}</div>
                                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.repair_details}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{renderAppointmentDate(appointment.appointment_date)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{appointment.appointment_time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusStyle(appointment.status)}`}>
                                                {getStatusText(appointment.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => handleSelectAppointment(appointment)}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
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
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลการจอง</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
                ไม่พบการจองที่ตรงกับเงื่อนไขการค้นหาในขณะนี้ คุณสามารถลองปรับเงื่อนไขการค้นหาใหม่
            </p>
            <button
                onClick={() => {
                    setFilters(INITIAL_FILTERS);
                    fetchAppointments();
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
                ดูการจองทั้งหมด
            </button>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                activeMenu="จัดการการจอง" 
            />
            
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
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
                                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {appointments.length} รายการ
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <button
                                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                        <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                            </div>
                        </div>
                    ) : appointments.length === 0 ? (
                        renderEmptyState()
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
                    onDelete={() => {
                        console.log('Delete appointment');
                        setSelectedAppointment(null);
                        fetchAppointments();
                    }}
                />
            )}
        </div>
    );
}