'use client'

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { formatDate, formatPhoneNumber, getStatusText, getStatusBadgeStyle } from '@/utils/format';
import { Repair } from '@/types/repairs';
import { Part } from '@/types/parts';

interface ViewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: Repair | null;
  onUpdateRepair: (repairId: number, updates: Partial<Repair>) => Promise<void>;
}

interface RepairPart {
  id: number;
  repair_id: number;
  part_id: number;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  part_name: string;
  part_code: string;
  category_name: string;
}

export function ViewRepairModal({ isOpen, onClose, repair, onUpdateRepair }: ViewRepairModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [repairParts, setRepairParts] = useState<RepairPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [searchPart, setSearchPart] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  // Calculate totals
  const partsTotal = repairParts.reduce((sum, part) => sum + Number(part.total_price), 0);
  const totalCost = Number(estimatedCost) + partsTotal;

  useEffect(() => {
    if (isOpen && repair) {
      setEstimatedCost(repair.estimated_cost || 0);
      setDescription(repair.description || '');
      fetchParts();
      fetchRepairParts();
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, repair]);

  const fetchParts = async () => {
    try {
      const response = await fetch(`/api/parts?status=active${searchPart ? `&search=${searchPart}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch parts');
      const data = await response.json();
      setParts(data);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const fetchRepairParts = async () => {
    if (!repair) return;
    try {
      const response = await fetch(`/api/repairs/${repair.id}/parts`);
      if (!response.ok) throw new Error('Failed to fetch repair parts');
      const data = await response.json();
      setRepairParts(data);
    } catch (error) {
      console.error('Error fetching repair parts:', error);
    }
  };

  const handleAddPart = async () => {
    if (!selectedPart || !repair) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/repairs/${repair.id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partId: parseInt(selectedPart),
          quantity
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add part');
      }

      await fetchRepairParts();
      setSelectedPart('');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding part:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePart = async (repairPartId: number) => {
    if (!repair) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/repairs/${repair.id}/parts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairPartId })
      });

      if (!response.ok) throw new Error('Failed to remove part');
      await fetchRepairParts();
    } catch (error) {
      console.error('Error removing part:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Repair['status']) => {
    if (!repair) return;
    
    try {
      setIsLoading(true);
      
      const finalPartsTotal = repairParts.reduce((sum, part) => sum + Number(part.total_price), 0);
      const finalTotalCost = Number(estimatedCost) + finalPartsTotal;
      
      const updates: Partial<Repair> = {
        status: newStatus,
        estimated_cost: Number(estimatedCost),
        parts_cost: finalPartsTotal,
        description,
        final_cost: finalTotalCost,
        completion_date: newStatus === 'completed' ? new Date().toISOString() : null
      };
      
      await onUpdateRepair(repair.id, updates);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !repair) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={handleClickOutside}>
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block w-full max-w-4xl text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl my-8">
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">รายละเอียดการซ่อม</h3>
              <p className="mt-1 text-sm text-gray-500">เลขที่งาน #{repair.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Customer and Vehicle Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ข้อมูลลูกค้า</h4>
                  <p className="mt-1 font-medium">{repair.customer?.name}</p>
                  <p className="text-sm text-gray-500">โทร: {formatPhoneNumber(repair.customer?.phone)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ข้อมูลรถ</h4>
                  <p className="mt-1">{repair.brand} {repair.model}</p>
                  <p className="text-sm text-gray-500">ทะเบียน: {repair.license_plate}</p>
                  <p className="text-sm text-gray-500">เลขไมล์: {repair.mileage?.toLocaleString()} กม.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">วันที่</h4>
                  <p className="mt-1">วันรับรถ: {formatDate(repair.start_date)}</p>
                  <p className="text-sm text-gray-500">นัดรับรถ: {repair.expected_end_date ? formatDate(repair.expected_end_date) : '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">สถานะ</h4>
                  <div className="mt-1 flex items-center gap-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(repair.status)}`}>
                      {getStatusText(repair.status)}
                    </span>
                    <select
                      value={repair.status}
                      onChange={(e) => handleStatusChange(e.target.value as Repair['status'])}
                      className="text-sm border-gray-300 rounded-md"
                      disabled={isLoading}
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="in_progress">กำลังซ่อม</option>
                      <option value="completed">เสร็จสิ้น</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Repair Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">อาการ/ปัญหา</h4>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            {/* Cost Estimates */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">ราคาประเมิน</h4>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="mt-1 px-3 py-2 border rounded-md w-full"
              />
            </div>

            {/* Parts Management */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="text-lg font-semibold text-gray-900">รายการอะไหล่</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ค้นหาอะไหล่..."
                    value={searchPart}
                    onChange={(e) => setSearchPart(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={fetchParts}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md whitespace-nowrap"
                  >
                    ค้นหา
                  </button>
                </div>
              </div>

              {/* Add Part Form */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลือกอะไหล่
                  </label>
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">เลือกอะไหล่</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.code} - {part.name} (คงเหลือ: {part.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    onClick={handleAddPart}
                    disabled={isLoading || !selectedPart}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             disabled:bg-blue-300 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มอะไหล่'}
                  </button>
                </div>
              </div>

              {/* Parts Table */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">รหัส</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">อะไหล่</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">ราคา/หน่วย</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">จำนวน</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">รวม</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {repairParts.map((part) => (
                          <tr key={part.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{part.part_code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {part.part_name}
                              {part.category_name && (
                                <span className="text-gray-500 text-xs ml-1">
                                  ({part.category_name})
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              ฿{part.price_per_unit.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {part.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              ฿{part.total_price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleRemovePart(part.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-800 disabled:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {repairParts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                              ยังไม่มีรายการอะไหล่
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            รวมค่าอะไหล่
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ฿{partsTotal.toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:justify-between p-4 sm:px-6 sm:py-4 border-t bg-gray-50 gap-4 sm:gap-0">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                <span className="font-medium">ราคาประเมิน:</span> ฿{Number(estimatedCost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">ค่าอะไหล่รวม:</span> ฿{partsTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-base font-medium text-gray-900">
                รวมทั้งหมด: ฿{totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            <div className="flex gap-3 sm:items-start">
              <button
                onClick={() => handleStatusChange(repair.status)}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}