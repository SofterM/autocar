import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Trash2 } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
      id: number;
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
  };
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export default function ManageAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onUpdateStatus,
  onDelete
}: AppointmentModalProps) {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const formatDate = (date: string) => {
      const d = new Date(date);
      return d.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          timeZone: 'Asia/Bangkok'
      });
  };

  const handleStatusChange = async (status: string) => {
      setError('');
      setIsLoading(true);
      try {
          const response = await fetch(`/api/appointments/${appointment.id}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status }),
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to update status');
          }

          onUpdateStatus(appointment.id, status);
          onClose();
      } catch (error: any) {
          setError(error.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleDelete = async () => {
      setError('');
      setIsLoading(true);
      try {
          const response = await fetch(`/api/appointments/${appointment.id}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to delete appointment');
          }

          setDeleteSuccess(true);
          onDelete(appointment.id);
          setTimeout(() => {
              onClose();
          }, 1500);
      } catch (error: any) {
          setError(error.message);
      } finally {
          setIsLoading(false);
      }
  };

  const getStatusText = (status: string) => {
      switch(status) {
          case 'confirmed': return 'ยืนยันแล้ว';
          case 'cancelled': return 'ยกเลิกแล้ว';
          case 'pending': return 'รอดำเนินการ';
          default: return status;
      }
  };

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
          case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
          case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
  };

  if (deleteSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ลบการจองเรียบร้อยแล้ว</h3>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
              <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">รายละเอียดการจอง</h2>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setShowDeleteConfirm(true)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                              disabled={isLoading}
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                          <button 
                              onClick={onClose}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                              <X className="w-5 h-5 text-gray-500" />
                          </button>
                      </div>
                  </div>
                  
                  <div className="space-y-6">
                      {error && (
                          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                              {error}
                          </div>
                      )}

                      {showDeleteConfirm ? (
                          <div className="space-y-4">
                              <div className="text-center">
                                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ยืนยันการลบการจอง</h3>
                                  <p className="text-gray-600">คุณต้องการลบการจองนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <button
                                      onClick={() => setShowDeleteConfirm(false)}
                                      disabled={isLoading}
                                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                      ยกเลิก
                                  </button>
                                  <button
                                      onClick={handleDelete}
                                      disabled={isLoading}
                                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  >
                                      {isLoading ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                                  </button>
                              </div>
                          </div>
                      ) : (
                          // Rest of the component remains the same
                          <>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-3 mb-3">
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                          <span className="text-blue-600 font-semibold">
                                              {appointment.user.firstName.charAt(0)}
                                          </span>
                                      </div>
                                      <div>
                                          <div className="font-medium text-gray-900">
                                              {appointment.user.firstName} {appointment.user.lastName}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                              {appointment.user.phone}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <div className="font-medium text-gray-700 mb-2">บริการที่จอง</div>
                                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                      {appointment.service}
                                  </div>
                              </div>

                              <div>
                                  <div className="font-medium text-gray-700 mb-2">รายละเอียดการซ่อม</div>
                                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                                      {appointment.repair_details}
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <div className="font-medium text-gray-700 mb-2">วันที่</div>
                                      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                          {formatDate(appointment.appointment_date)}
                                      </div>
                                  </div>
                                  <div>
                                      <div className="font-medium text-gray-700 mb-2">เวลา</div>
                                      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                          {appointment.appointment_time}
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <div className={`p-3 rounded-lg border ${getStatusStyle(appointment.status)}`}>
                                      <div className="flex items-center justify-between">
                                          <span>สถานะปัจจุบัน: {getStatusText(appointment.status)}</span>
                                          {appointment.status === 'pending' ? (
                                              <AlertTriangle className="w-5 h-5" />
                                          ) : (
                                              <CheckCircle2 className="w-5 h-5" />
                                          )}
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                      <button
                                          onClick={() => handleStatusChange('confirmed')}
                                          disabled={isLoading}
                                          className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                      >
                                          <CheckCircle2 className="w-5 h-5" />
                                          ยืนยันการจอง
                                      </button>
                                      
                                      <button
                                          onClick={() => handleStatusChange('cancelled')}
                                          disabled={isLoading}
                                          className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                      >
                                          <AlertTriangle className="w-5 h-5" />
                                          ยกเลิกการจอง
                                      </button>
                                  </div>
                              </div>
                          </>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );
}