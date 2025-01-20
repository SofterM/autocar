// src/app/admin/repairs/[id]/page.tsx
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Wrench,
    User,
    Car,
    DollarSign,
    Plus
} from 'lucide-react';
import { AddPartModal } from './AddPartModal';

interface RepairPart {
    id: string;
    part_name: string;
    part_code: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
    category_name: string;
}

interface RepairDetail {
    id: string;
    status: string;
    brand: string;
    model: string;
    license_plate: string;
    color: string;
    mileage: number;
    start_date: string;
    expected_end_date: string | null;
    actual_end_date: string | null;
    description: string;
    estimated_cost: number;
    parts_cost: number;
    labor_cost: number;
    total_cost: number;
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
    parts: RepairPart[];
}

function RepairDetail({ id }: { id: string }) {
    const router = useRouter();
    const [repair, setRepair] = React.useState<RepairDetail | null>(null);
    const [technicians, setTechnicians] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEditing, setIsEditing] = React.useState(false);
    const [isAddPartModalOpen, setIsAddPartModalOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({
        status: '',
        technicianId: '',
        laborCost: '',
        description: '',
        expectedEndDate: ''
    });

    React.useEffect(() => {
        if (id) {
            fetchRepairDetails();
            fetchTechnicians();
        }
    }, [id]);

    const fetchRepairDetails = async () => {
        try {
            const response = await fetch(`/api/repairs/${id}`);
            if (!response.ok) throw new Error('Failed to fetch repair details');
            const data = await response.json();
            setRepair(data);
            setFormData({
                status: data.status,
                technicianId: data.technician?.id || '',
                laborCost: data.labor_cost?.toString() || '',
                description: data.description || '',
                expectedEndDate: data.expected_end_date || ''
            });
        } catch (error) {
            console.error('Error fetching repair details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await fetch('/api/technicians');
            if (!response.ok) throw new Error('Failed to fetch technicians');
            const data = await response.json();
            setTechnicians(data);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/repairs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: formData.status,
                    technicianId: formData.technicianId || null,
                    laborCost: parseFloat(formData.laborCost) || 0,
                    description: formData.description,
                    expectedEndDate: formData.expectedEndDate || null
                })
            });

            if (!response.ok) throw new Error('Failed to update repair');
            
            const updatedRepair = await response.json();
            setRepair(updatedRepair);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating repair:', error);
        }
    };

    const handleAddPart = async (partData: { partId: string; quantity: number }) => {
        try {
            const response = await fetch(`/api/repairs/${id}/parts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add part');
            }

            fetchRepairDetails();
            setIsAddPartModalOpen(false);
        } catch (error) {
            console.error('Error adding part:', error);
            alert(error instanceof Error ? error.message : 'Failed to add part');
        }
    };

    const handleRemovePart = async (repairPartId: string) => {
        if (!confirm('ต้องการลบอะไหล่นี้ออกจากงานซ่อมใช่หรือไม่?')) return;

        try {
            const response = await fetch(`/api/repairs/${id}/parts`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repairPartId })
            });

            if (!response.ok) throw new Error('Failed to remove part');
            fetchRepairDetails();
        } catch (error) {
            console.error('Error removing part:', error);
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'in_progress':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!repair) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold text-gray-900">ไม่พบข้อมูลงานซ่อม</h1>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                    ย้อนกลับ
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="mr-4 p-2 rounded-lg hover:bg-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            รายละเอียดงานซ่อม #{repair.id}
                        </h1>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            แก้ไข
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                บันทึก
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status and Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">สถานะงานซ่อม</h2>
                                    {!isEditing ? (
                                        <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeStyle(repair.status)}`}>
                                            {repair.status === 'pending' && 'รอดำเนินการ'}
                                            {repair.status === 'in_progress' && 'กำลังซ่อม'}
                                            {repair.status === 'completed' && 'เสร็จสิ้น'}
                                            {repair.status === 'cancelled' && 'ยกเลิก'}
                                        </span>
                                    ) : (
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="pending">รอดำเนินการ</option>
                                            <option value="in_progress">กำลังซ่อม</option>
                                            <option value="completed">เสร็จสิ้น</option>
                                            <option value="cancelled">ยกเลิก</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">วันที่รับรถ</h3>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(repair.start_date)}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">กำหนดเสร็จ</h3>
                                    {!isEditing ? (
                                        <p className="mt-1 text-sm text-gray-900">
                                            {repair.expected_end_date ? formatDate(repair.expected_end_date) : '-'}
                                        </p>
                                    ) : (
                                        <input
                                            type="date"
                                            value={formData.expectedEndDate}
                                            onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    )}
                                </div>

                                {repair.actual_end_date && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">วันที่เสร็จจริง</h3>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(repair.actual_end_date)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">รายละเอียดงานซ่อม</h3>
                                {!isEditing ? (
                                    <p className="text-sm text-gray-900">{repair.description || '-'}</p>
                                ) : (
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="รายละเอียดงานซ่อม..."
                                    />
                                )}
                            </div>
                        </div>

                        {/* Parts List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">รายการอะไหล่</h2>
                                <button
                                    onClick={() => setIsAddPartModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    เพิ่มอะไหล่
                                </button>
                            </div>

                            {repair.parts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">รายการ</th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                                                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                                                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">ราคา/หน่วย</th>
                                                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">ราคารวม</th>
                                                <th className="px-4 py-3 bg-gray-50"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {repair.parts.map((part) => (
                                                <tr key={part.id}>
                                                    <td className="px-4 py-4 text-sm text-gray-900">{part.part_code}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">{part.part_name}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">{part.category_name}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 text-right">{part.quantity}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                                                        ฿{part.price_per_unit.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                                                        ฿{part.total_price.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-right">
                                                        <button
                                                            onClick={() => handleRemovePart(part.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            ลบ
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-200">
                                                <td colSpan={5} className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                                                    ราคาอะไหล่รวม
                                                </td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                                                    ฿{repair.parts_cost.toLocaleString()}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    ยังไม่มีรายการอะไหล่
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Vehicle Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Car className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">ข้อมูลรถ</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">ยี่ห้อ/รุ่น</h3>
                                    <p className="mt-1 text-sm text-gray-900">{repair.brand} {repair.model}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">เลขทะเบียน</h3>
                                    <p className="mt-1 text-sm text-gray-900">{repair.license_plate}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">สี</h3>
                                    <p className="mt-1 text-sm text-gray-900">{repair.color || '-'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">เลขไมล์</h3>
                                    <p className="mt-1 text-sm text-gray-900">{repair.mileage.toLocaleString()} กม.</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">ข้อมูลลูกค้า</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">ชื่อ</h3>
                                    <p className="mt-1 text-sm text-gray-900">{repair.customer.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">เบอร์โทร</h3>
                                    <p className="mt-1 text-sm text-gray-900">{repair.customer.phone}</p>
                                </div>
                                {repair.customer.email && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">อีเมล</h3>
                                        <p className="mt-1 text-sm text-gray-900">{repair.customer.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Technician Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Wrench className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">ช่างซ่อม</h2>
                            </div>
                            
                            {!isEditing ? (
                                <div className="space-y-4">
                                    {repair.technician ? (
                                        <>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">ชื่อ</h3>
                                                <p className="mt-1 text-sm text-gray-900">{repair.technician.name}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">ตำแหน่ง</h3>
                                                <p className="mt-1 text-sm text-gray-900">{repair.technician.position}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">ยังไม่ได้กำหนดช่างซ่อม</p>
                                    )}
                                </div>
                            ) : (
                                <select
                                    value={formData.technicianId}
                                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">เลือกช่างซ่อม</option>
                                    {technicians.map((tech: any) => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name} - {tech.position}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Cost Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">สรุปค่าใช้จ่าย</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm text-gray-500">ประมาณการค่าซ่อม</h3>
                                    <p className="text-sm text-gray-900">฿{repair.estimated_cost.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm text-gray-500">ค่าอะไหล่</h3>
                                    <p className="text-sm text-gray-900">฿{repair.parts_cost.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm text-gray-500">ค่าแรง</h3>
                                    {!isEditing ? (
                                        <p className="text-sm text-gray-900">฿{repair.labor_cost.toLocaleString()}</p>
                                    ) : (
                                        <input
                                            type="number"
                                            value={formData.laborCost}
                                            onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                                            className="w-32 px-3 py-1 text-right border border-gray-300 rounded-lg"
                                            placeholder="0"
                                        />
                                    )}
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-gray-900">รวมทั้งหมด</h3>
                                        <p className="font-medium text-gray-900">฿{repair.total_cost.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Part Modal */}
            <AddPartModal
                isOpen={isAddPartModalOpen}
                onClose={() => setIsAddPartModalOpen(false)}
                onAdd={handleAddPart}
            />
        </div>
    );
}

export default function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    return <RepairDetail id={resolvedParams.id} />;
}