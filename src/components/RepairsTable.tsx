'use client'

import React from 'react';
import { Wrench, Plus } from 'lucide-react';
import { Repair } from '@/types/repairs';
import { formatDate, formatPhoneNumber, getStatusText, getStatusBadgeStyle } from '@/utils/format';

interface RepairsTableProps {
    repairs: Repair[];
    isLoading: boolean;
    onViewRepair: (repair: Repair) => void;
    onAddRepair: () => void;
}

export const RepairsTable: React.FC<RepairsTableProps> = ({
    repairs,
    isLoading,
    onViewRepair,
    onAddRepair
}) => {
    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (repairs.length === 0) {
        return (
            <div className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบรายการซ่อม</h3>
                <p className="mt-2 text-sm text-gray-500">เริ่มต้นสร้างรายการซ่อมใหม่</p>
                <div className="mt-6">
                    <button
                        onClick={onAddRepair}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        สร้างงานใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ข้อมูลรถ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ข้อมูลลูกค้า</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประมาณการ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {repairs.map((repair) => (
                            <tr key={repair?.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {repair?.brand} {repair?.model}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ทะเบียน: {repair?.license_plate}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            เลขไมล์: {repair?.mileage?.toLocaleString()} กม.
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {repair?.customer?.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            โทร: {formatPhoneNumber(repair?.customer?.phone)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm text-gray-900">
                                            <span className="font-medium">วันรับรถ:</span><br/>
                                            {formatDate(repair?.start_date)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <span className="font-medium">นัดรับรถ:</span><br/>
                                            {repair?.expected_end_date ? formatDate(repair.expected_end_date) : '-'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm text-gray-900">
                                            <span className="font-medium">ประเมินราคา:</span><br/>
                                            ฿{repair?.estimated_cost?.toLocaleString()}
                                        </div>
                                        {repair?.final_cost && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                <span className="font-medium">ค่าซ่อมจริง:</span><br/>
                                                ฿{repair?.final_cost?.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(repair?.status)}`}>
                                        {getStatusText(repair?.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                    <button 
                                        onClick={() => onViewRepair(repair)}
                                        className="text-blue-600 hover:text-blue-900 font-medium"
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
    );
};

export default RepairsTable;