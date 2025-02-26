import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, X, Trash2, Calendar, Clock, MessageSquare, User } from 'lucide-react';

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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add animation class when opening
    const timer = setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.classList.add('opacity-100', 'translate-y-0');
      }
    }, 10);

    // Enable body scroll lock
    document.body.style.overflow = 'hidden';

    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'confirmed': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          case 'cancelled': return <X className="w-5 h-5 text-red-600" />;
          case 'pending': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
          default: return null;
      }
  };

  if (deleteSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 text-center transition-all duration-300 opacity-0 translate-y-4"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ลบการจองเรียบร้อยแล้ว</h3>
          <p className="text-gray-600 mb-4">ระบบได้ลบการจองนี้ออกจากฐานข้อมูลเรียบร้อยแล้ว</p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div 
            ref={modalRef}
            className="bg-white rounded-xl w-full max-w-md shadow-lg opacity-0 translate-y-4 transition-all duration-300"
          >
              <div className="px-6 pt-6 pb-4 border-b">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">รายละเอียดการจอง</h2>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setShowDeleteConfirm(true)}
                              className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600 group"
                              disabled={isLoading}
                              aria-label="ลบการจอง"
                          >
                              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                          <button 
                              onClick={onClose}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                              aria-label="ปิด"
                          >
                              <X className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
                          </button>
                      </div>
                  </div>
              </div>
              
              <div className="p-6">
                  <div className="space-y-6">
                      {error && (
                          <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                              <span>{error}</span>
                          </div>
                      )}

                      {showDeleteConfirm ? (
                          <div className="space-y-4">
                              <div className="text-center">
                                  <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ยืนยันการลบการจอง</h3>
                                  <p className="text-gray-600">คุณต้องการลบการจองนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mt-6">
                                  <button
                                      onClick={() => setShowDeleteConfirm(false)}
                                      disabled={isLoading}
                                      className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                  >
                                      ยกเลิก
                                  </button>
                                  <button
                                      onClick={handleDelete}
                                      disabled={isLoading}
                                      className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                                  >
                                      {isLoading ? (
                                        <>
                                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          <span>กำลังลบ...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="w-4 h-4" />
                                          <span>ยืนยันการลบ</span>
                                        </>
                                      )}
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <>
                              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3 mb-1">
                                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                                          <span className="text-blue-600 font-semibold text-lg">
                                              {appointment.user.firstName.charAt(0)}
                                          </span>
                                      </div>
                                      <div>
                                          <div className="font-medium text-gray-900 flex items-center gap-1">
                                              <User className="w-4 h-4 text-gray-500" />
                                              {appointment.user.firstName} {appointment.user.lastName}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                              {appointment.user.phone}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <div className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    บริการที่จอง
                                  </div>
                                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                                      {appointment.service}
                                  </div>
                              </div>

                              <div>
                                  <div className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    รายละเอียดการซ่อม
                                  </div>
                                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap shadow-sm border border-gray-100 max-h-32 overflow-y-auto">
                                      {appointment.repair_details}
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <div className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        วันที่
                                      </div>
                                      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                                          {formatDate(appointment.appointment_date)}
                                      </div>
                                  </div>
                                  <div>
                                      <div className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        เวลา
                                      </div>
                                      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                                          {appointment.appointment_time}
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <div className={`p-3 rounded-lg border ${getStatusStyle(appointment.status)}`}>
                                      <div className="flex items-center justify-between">
                                          <span className="font-medium">สถานะปัจจุบัน: {getStatusText(appointment.status)}</span>
                                          {getStatusIcon(appointment.status)}
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                      <button
                                          onClick={() => handleStatusChange('confirmed')}
                                          disabled={isLoading || appointment.status === 'confirmed'}
                                          className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                      >
                                          {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                          ) : (
                                            <>
                                              <CheckCircle2 className="w-5 h-5" />
                                              ยืนยันการจอง
                                            </>
                                          )}
                                      </button>
                                      
                                      <button
                                          onClick={() => handleStatusChange('cancelled')}
                                          disabled={isLoading || appointment.status === 'cancelled'}
                                          className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                      >
                                          {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                          ) : (
                                            <>
                                              <X className="w-5 h-5" />
                                              ยกเลิกการจอง
                                            </>
                                          )}
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