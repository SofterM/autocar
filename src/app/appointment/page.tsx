'use client'

import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, User, FileText, ArrowRight, Award, Wrench, Settings, ChartBar, Zap, Search, Home, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import StarryBackground from '@/components/StarryBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CalendarBookings from "@/components/CalendarBookings";
import { useRouter } from 'next/navigation';

interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'technician' | 'staff';
  phone: string | null;
}

const SERVICES = [
  {
    name: "ซ่อมเครื่องยนต์",
    icon: <Wrench className="w-6 h-6" />,
    description: "บริการซ่อมและแก้ไขปัญหาเครื่องยนต์",
  },
  {
    name: "เปลี่ยนอะไหล่",
    icon: <Settings className="w-6 h-6" />,
    description: "บริการเปลี่ยนอะไหล่รถยนต์ทุกชนิด",
  },
  {
    name: "ตรวจเช็คระยะ",
    icon: <ChartBar className="w-6 h-6" />,
    description: "บริการตรวจเช็คตามระยะทางที่กำหนด",
  },
  {
    name: "ซ่อมระบบไฟฟ้า",
    icon: <Zap className="w-6 h-6" />,
    description: "ตรวจสอบและซ่อมระบบไฟฟ้าทั้งหมดในรถ",
  },
  {
    name: "อื่นๆ",
    icon: <Search className="w-6 h-6" />,
    description: "บริการอื่นๆ นอกเหนือจากรายการข้างต้น",
  },
];

export default function AppointmentPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [repairDetails, setRepairDetails] = useState("");
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserProfile(user);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const isFormComplete = () => {
    return selectedService && selectedDate && selectedTime && repairDetails.trim() !== "";
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจองคิว");
      return;
    }

    try {
      if (!isFormComplete()) return;
      
      setIsSubmitting(true);

      const token = localStorage.getItem('token');
      const appointmentData = {
        user_id: userProfile?.id,
        service: selectedService,
        repair_details: repairDetails,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        status: "pending",
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      setShowSuccessPopup(true);
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setRepairDetails("");
      setActiveStep(1);
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการจองคิว");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    router.push('/');
  };

  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return selectedDate >= today && selectedDate <= thirtyDaysFromNow;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!validateDate(date)) {
      alert("กรุณาเลือกวันที่ภายใน 30 วัน และต้องไม่เป็นวันที่ผ่านมาแล้ว");
      return;
    }
    setSelectedDate(date);
  };

  const nextStep = () => {
    if (activeStep < 3) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  // Format Thai date for display
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <StarryBackground />
      <div className="relative flex-1">
        <Navbar />
        <main className="min-h-screen pb-32">
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">จองคิวบริการ</h1>
              <p className="text-gray-400">บริการซ่อมบำรุงรถยนต์โดยทีมช่างผู้เชี่ยวชาญ</p>
            </motion.div>

            {/* Stepper */}
            <motion.div 
              className="mb-10 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full flex items-center justify-center w-10 h-10 ${activeStep >= 1 ? 'bg-[#6C63FF] text-white' : 'bg-gray-700 text-gray-300'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${activeStep >= 1 ? 'text-white' : 'text-gray-400'}`}>ข้อมูลผู้จอง</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${activeStep >= 2 ? 'bg-[#6C63FF]' : 'bg-gray-700'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`rounded-full flex items-center justify-center w-10 h-10 ${activeStep >= 2 ? 'bg-[#6C63FF] text-white' : 'bg-gray-700 text-gray-300'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${activeStep >= 2 ? 'text-white' : 'text-gray-400'}`}>รายละเอียดบริการ</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${activeStep >= 3 ? 'bg-[#6C63FF]' : 'bg-gray-700'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`rounded-full flex items-center justify-center w-10 h-10 ${activeStep >= 3 ? 'bg-[#6C63FF] text-white' : 'bg-gray-700 text-gray-300'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${activeStep >= 3 ? 'text-white' : 'text-gray-400'}`}>เวลาและยืนยัน</span>
                </div>
              </div>
            </motion.div>

            {/* Step 1: User Information */}
            {activeStep === 1 && (
              <motion.div
                className="bg-gray-900/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-[#6C63FF]/20 p-2 rounded-lg">
                    <User className="w-6 h-6 text-[#6C63FF]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">ข้อมูลผู้จอง</h2>
                </div>

                {!isAuthenticated ? (
                  <div className="text-center p-10 rounded-xl bg-gray-800/50 mb-4">
                    <div className="flex justify-center mb-4">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">กรุณาเข้าสู่ระบบ</h3>
                    <p className="text-gray-400 mb-6">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถจองคิวบริการได้</p>
                    <button className="px-8 py-2 bg-[#6C63FF] text-white rounded-lg font-medium hover:bg-[#5B54FF] transition-all">
                      เข้าสู่ระบบ
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ชื่อ
                      </label>
                      <input
                        type="text"
                        value={userProfile?.firstName || "-"}
                        disabled
                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/80 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        นามสกุล
                      </label>
                      <input
                        type="text"
                        value={userProfile?.lastName || "-"}
                        disabled
                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/80 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        อีเมล
                      </label>
                      <input
                        type="email"
                        value={userProfile?.email || "-"}
                        disabled
                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/80 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="tel"
                        value={userProfile?.phone || "-"}
                        disabled
                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/80 text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={nextStep}
                    disabled={!isAuthenticated}
                    className="px-6 py-2 bg-[#6C63FF] text-white rounded-lg flex items-center space-x-2 hover:bg-[#5B54FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>ถัดไป</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Service Details */}
            {activeStep === 2 && (
              <>
                <motion.div
                  className="bg-gray-900/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-[#6C63FF]/20 p-2 rounded-lg">
                      <Award className="w-6 h-6 text-[#6C63FF]" />
                    </div>
                    <h2 className="text-xl font-bold text-white">เลือกบริการ</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {SERVICES.map((service) => (
                      <div
                        key={service.name}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border ${
                          selectedService === service.name
                            ? "bg-gradient-to-br from-[#6C63FF] to-[#5B54FF] text-white border-[#6C63FF] shadow-lg shadow-[#6C63FF]/20"
                            : "bg-gray-800/70 hover:bg-gray-800 hover:border-[#6C63FF]/50 border-gray-700 text-white"
                        }`}
                        onClick={() => setSelectedService(service.name)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={selectedService === service.name ? "text-white" : "text-[#6C63FF]"}>
                              {service.icon}
                            </div>
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <p className={`text-sm ${
                            selectedService === service.name
                              ? "text-gray-100"
                              : "text-gray-400"
                          }`}>
                            {service.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-white font-medium mb-3">
                      <FileText className="w-5 h-5 text-[#6C63FF]" />
                      <span>รายละเอียดการซ่อม:</span>
                    </label>
                    <textarea
                      value={repairDetails}
                      onChange={(e) => setRepairDetails(e.target.value)}
                      placeholder="กรุณาระบุรายละเอียดการซ่อม หรืออาการของรถ"
                      className="w-full p-4 rounded-lg border border-gray-700 bg-gray-800/80 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 min-h-32 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="flex justify-between mt-6">
                    <button 
                      onClick={prevStep}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      ย้อนกลับ
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={!selectedService || !repairDetails.trim()}
                      className="px-6 py-2 bg-[#6C63FF] text-white rounded-lg flex items-center space-x-2 hover:bg-[#5B54FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>ถัดไป</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {/* Step 3: Date, Time and Confirmation */}
            {activeStep === 3 && (
              <>
                <motion.div
                  className="bg-gray-900/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-[#6C63FF]/20 p-2 rounded-lg">
                          <Calendar className="w-6 h-6 text-[#6C63FF]" />
                        </div>
                        <h2 className="text-xl font-bold text-white">เลือกวันที่</h2>
                      </div>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/80 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-[#6C63FF]/20 p-2 rounded-lg">
                          <Clock className="w-6 h-6 text-[#6C63FF]" />
                        </div>
                        <h2 className="text-xl font-bold text-white">เลือกเวลา</h2>
                      </div>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/80 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50"
                      >
                        <option value="">เลือกเวลา</option>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="12:00">12:00</option>
                        <option value="13:00">13:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-[#6C63FF]/20 p-2 rounded-lg">
                        <Calendar className="w-6 h-6 text-[#6C63FF]" />
                      </div>
                      <h2 className="text-xl font-bold text-white">ตารางการจอง</h2>
                    </div>
                    <CalendarBookings />
                  </div>

                  <div className="bg-[#6C63FF]/10 backdrop-blur-lg p-6 rounded-xl border border-[#6C63FF]/30 mb-8">
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center space-x-2">
                      <CheckCircle className="w-6 h-6 text-[#6C63FF]" />
                      <span>สรุปการจอง</span>
                    </h2>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:justify-between p-3 border-b border-gray-700/50">
                        <span className="font-medium text-[#6C63FF]">ผู้จอง:</span>
                        <span className="text-white">
                          {userProfile
                            ? `${userProfile.firstName} ${userProfile.lastName}`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between p-3 border-b border-gray-700/50">
                        <span className="font-medium text-[#6C63FF]">เบอร์ติดต่อ:</span>
                        <span className="text-white">{userProfile?.phone || "-"}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between p-3 border-b border-gray-700/50">
                        <span className="font-medium text-[#6C63FF]">บริการ:</span>
                        <span className="text-white">{selectedService || "ยังไม่ได้เลือก"}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between p-3 border-b border-gray-700/50">
                        <span className="font-medium text-[#6C63FF]">รายละเอียด:</span>
                        <span className="text-white max-w-full md:max-w-[70%] break-words">{repairDetails || "ยังไม่ได้ระบุ"}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between p-3 border-b border-gray-700/50">
                        <span className="font-medium text-[#6C63FF]">วันที่:</span>
                        <span className="text-white">{formatThaiDate(selectedDate) || "ยังไม่ได้เลือก"}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between p-3">
                        <span className="font-medium text-[#6C63FF]">เวลา:</span>
                        <span className="text-white">{selectedTime || "ยังไม่ได้เลือก"} น.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-10 py-3 bg-gradient-to-r from-[#6C63FF] to-[#5B54FF] text-white rounded-lg font-medium
                        transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/20
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      disabled={!isFormComplete() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>กำลังดำเนินการ...</span>
                        </>
                      ) : (
                        <span>ยืนยันการจอง</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              </>
            )}

          </div>
        </main>
      </div>
      
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 border border-[#6C63FF]/30 rounded-2xl shadow-xl max-w-md w-full p-6 relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={closeSuccessPopup}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#6C63FF]/20 flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-[#6C63FF]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">จองคิวสำเร็จ!</h3>
                <p className="text-gray-300 mb-6">ขอบคุณที่ใช้บริการของเรา ข้อมูลการจองของคุณได้ถูกบันทึกเรียบร้อยแล้ว</p>
                
                <button
                  onClick={closeSuccessPopup}
                  className="w-full py-3 bg-gradient-to-r from-[#6C63FF] to-[#5B54FF] text-white rounded-lg font-medium
                  transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/20 flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>กลับไปหน้าหลัก</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}