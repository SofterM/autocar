'use client'

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Menu,
    Bell,
    Filter,
    Wrench,
    CircleDollarSign,
    Clock,
    CheckCircle
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { AddRepairModal } from '@/components/AddRepairModal';
import { ViewRepairModal } from '@/components/ViewRepairModal';
import { RepairsTable } from '@/components/RepairsTable';
import { Repair } from '@/types/repairs';

export default function RepairsPage() {
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
                throw new Error('Failed to fetch repairs');
            }
            const data = await response.json();
            setRepairs(data || []);
        } catch (error) {
            console.error('Error fetching repairs:', error);
            setRepairs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRepair = async (repairId: number, updates: Partial<Repair>) => {
        try {
            const response = await fetch(`/api/repairs/${repairId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update repair');
            }

            await fetchRepairs();

            if (selectedRepair && selectedRepair.id === repairId) {
                const updatedRepair = await response.json();
                setSelectedRepair(updatedRepair);
            }

        } catch (error) {
            console.error('Error updating repair:', error);
            throw error;
        }
    };

    const handleDeleteRepair = async (repair: Repair) => {
        try {
            const response = await fetch(`/api/repairs/${repair.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete repair');
            }

            // Refresh the repairs list after successful deletion
            await fetchRepairs();
            
            // If the deleted repair was selected, close its modal
            if (selectedRepair?.id === repair.id) {
                setSelectedRepair(null);
            }
        } catch (error: any) {
            console.error('Error deleting repair:', error);
            throw new Error(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    const completedRepairs = repairs.filter(r => r?.status === 'completed');
    const totalRevenue = completedRepairs.reduce((sum, repair) => sum + (repair?.final_cost || 0), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const statistics = [
        {
            title: 'งานซ่อมทั้งหมด',
            value: repairs?.length || 0,
            subtitle: 'งานในระบบ',
            icon: Wrench,
            color: 'bg-blue-500'
        },
        {
            title: 'รอดำเนินการ',
            value: repairs?.filter(r => r?.status === 'pending')?.length || 0,
            subtitle: 'งานที่ยังไม่เริ่ม',
            icon: Clock,
            color: 'bg-amber-500'
        },
        {
            title: 'กำลังดำเนินการ',
            value: repairs?.filter(r => r?.status === 'in_progress')?.length || 0,
            subtitle: 'งานที่กำลังซ่อม',
            icon: Wrench,
            color: 'bg-indigo-500'
        },
        {
            title: 'รายได้จากงานสำเร็จ',
            value: `฿${formatCurrency(totalRevenue)}`,
            subtitle: `${completedRepairs.length} งานที่เสร็จสิ้น`,
            icon: CheckCircle,
            color: 'bg-emerald-500'
        }
    ];

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
                                    {repairs?.length || 0} รายการ
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
                    <RepairsTable
                        repairs={repairs}
                        isLoading={isLoading}
                        onViewRepair={(repair) => setSelectedRepair(repair)}
                        onAddRepair={() => setIsAddModalOpen(true)}
                        onDeleteRepair={handleDeleteRepair}
                    />
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
            <ViewRepairModal
                isOpen={!!selectedRepair}
                onClose={() => setSelectedRepair(null)}
                repair={selectedRepair}
                onUpdateRepair={handleUpdateRepair}
            />
        </div>
    );
}