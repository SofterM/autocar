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

const categories = [
  { id: 'others', name: 'อื่นๆ' },
  { id: 'engine_repair', name: 'ซ่อมเครื่องยนต์' },
  { id: 'parts_replacement', name: 'เปลี่ยนอะไหล่' },
  { id: 'maintenance', name: 'ตรวจเช็คระยะ' },
  { id: 'electrical_repair', name: 'ซ่อมระบบไฟฟ้า' },
];

const statuses = [
  { value: 'pending', label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'กำลังซ่อม', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
];

export function ViewRepairModal({ isOpen, onClose, repair, onUpdateRepair }: ViewRepairModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [repairParts, setRepairParts] = useState<RepairPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [searchPart, setSearchPart] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [customerData, setCustomerData] = useState<{ name: string, phone: string }>({ name: '', phone: '' });

  // Calculate totals
  const partsTotal = repairParts.reduce((sum, part) => sum + Number(part.total_price), 0);
  const totalCost = Number(estimatedCost) + partsTotal;

  useEffect(() => {
    if (isOpen && repair) {
      setEstimatedCost(repair.estimated_cost || 0);
      setDescription(repair.description || '');
      setCategory(repair.category || 'others');
      
      // Save customer data
      if (repair.customer) {
        setCustomerData({
          name: repair.customer.name || '',
          phone: repair.customer.phone || ''
        });
      }
      
      fetchParts();
      fetchRepairParts();
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add event listener for ESC key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, repair]);

  // Refresh parts list when parts are added or removed
  useEffect(() => {
    if (isOpen) {
      fetchParts();
    }
  }, [repairParts]);

  // Update final cost when parts or estimated cost changes
  useEffect(() => {
    if (repair && isOpen) {
      // Debounce updating the final cost to avoid too many API calls
      const timer = setTimeout(() => {
        handleUpdateFinalCost();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [partsTotal, estimatedCost]);

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

  const handleUpdateFinalCost = async () => {
    if (!repair) return;
    
    try {
      const updates: Partial<Repair> = {
        parts_cost: partsTotal,
        final_cost: totalCost
      };
      
      await onUpdateRepair(repair.id, updates);
    } catch (error) {
      console.error('Error updating final cost:', error);
    }
  };

  const handleStatusOrCategoryChange = async (newStatus?: Repair['status'], newCategory?: string) => {
    if (!repair) return;
    
    try {
      setIsLoading(true);
      
      const finalPartsTotal = repairParts.reduce((sum, part) => sum + Number(part.total_price), 0);
      const finalTotalCost = Number(estimatedCost) + finalPartsTotal;
      
      const updates: Partial<Repair> = {
        status: newStatus || repair.status,
        category: newCategory || category || 'others',
        estimated_cost: Number(estimatedCost),
        parts_cost: finalPartsTotal,
        description,
        final_cost: finalTotalCost,
        completion_date: newStatus === 'completed' ? new Date().toISOString() : null
      };
      
      await onUpdateRepair(repair.id, updates);
    } catch (error) {
      console.error('Error updating repair:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstimatedCost(Number(e.target.value));
  };

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (repair && (description !== repair.description || estimatedCost !== repair.estimated_cost)) {
        handleStatusOrCategoryChange();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [description, estimatedCost]);

  if (!isOpen || !repair) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm" 
      onClick={handleClickOutside}
    >
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block w-full max-w-4xl text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl my-8">
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">รายละเอียดการซ่อม</h3>
              <p className="mt-1 text-sm text-gray-500">เลขที่งาน #{repair.id}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
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
                  <p className="mt-1 font-medium">{customerData.name}</p>
                  <p className="text-sm text-gray-500">โทร: {formatPhoneNumber(customerData.phone)}</p>
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
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">สถานะ</h4>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusOrCategoryChange(status.value as Repair['status'])}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            repair.status === status.value 
                              ? status.color + ' ring-2 ring-offset-1 ring-gray-400' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          disabled={isLoading}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">หมวดหมู่</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategory(cat.id);
                            handleStatusOrCategoryChange(undefined, cat.id);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium truncate transition-colors ${
                            (repair.category || category) === cat.id
                              ? 'bg-blue-100 text-blue-800 ring-2 ring-offset-1 ring-blue-400'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          disabled={isLoading}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Repair Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">อาการ/ปัญหา</h4>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                onBlur={() => handleStatusOrCategoryChange()}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            {/* Cost Estimates */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">ราคาประเมิน</h4>
              <input
                type="number"
                value={estimatedCost}
                onChange={handleCostChange}
                onBlur={() => handleStatusOrCategoryChange()}
                className="mt-1 px-3 py-2 border rounded-lg w-full"
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
                    className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={fetchParts}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    onClick={handleAddPart}
                    disabled={isLoading || !selectedPart}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
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
          <div className="flex flex-col sm:flex-row sm:justify-between p-4 sm:px-6 sm:py-4 border-t bg-gray-50 gap-4 sm:gap-0 rounded-b-2xl">
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
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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