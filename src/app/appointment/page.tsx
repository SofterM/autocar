"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, User } from "lucide-react";

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
    icon: "🔧",
    description: "บริการซ่อมและแก้ไขปัญหาเครื่องยนต์",
  },
  {
    name: "เปลี่ยนอะไหล่",
    icon: "⚙️",
    description: "บริการเปลี่ยนอะไหล่รถยนต์ทุกชนิด",
  },
  {
    name: "ตรวจเช็คระยะ",
    icon: "📊",
    description: "บริการตรวจเช็คตามระยะทางที่กำหนด",
  },
  {
    name: "ซ่อมระบบไฟฟ้า",
    icon: "⚡",
    description: "ตรวจสอบและซ่อมระบบไฟฟ้าทั้งหมดในรถ",
  },
  {
    name: "อื่นๆ",
    icon: "🔍",
    description: "บริการอื่นๆ นอกเหนือจากรายการข้างต้น",
  },
];

export default function AppointmentPage() {
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    return selectedService && selectedDate && selectedTime;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจองคิว");
      return;
    }

    try {
      if (!isFormComplete()) return;

      const token = localStorage.getItem('token');
      const appointmentData = {
        user_id: userProfile?.id,
        service: selectedService,
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

      alert("จองคิวสำเร็จ!");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการจองคิว");
    }
  };

  // Validate date is not in the past and not more than 30 days in the future
  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return selectedDate >= today && selectedDate <= thirtyDaysFromNow;
  };

  // Handle date change with validation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!validateDate(date)) {
      alert("กรุณาเลือกวันที่ภายใน 30 วัน และต้องไม่เป็นวันที่ผ่านมาแล้ว");
      return;
    }
    setSelectedDate(date);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-purple-800 text-center">
          จองคิวบริการ
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 mb-8">
          <h2 className="text-xl font-bold mb-6 text-purple-800 flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>ข้อมูลผู้จอง</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                ชื่อ
              </label>
              <input
                type="text"
                value={userProfile?.firstName || "-"}
                disabled
                className="w-full p-3 rounded-lg border border-purple-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                นามสกุล
              </label>
              <input
                type="text"
                value={userProfile?.lastName || "-"}
                disabled
                className="w-full p-3 rounded-lg border border-purple-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                value={userProfile?.email || "-"}
                disabled
                className="w-full p-3 rounded-lg border border-purple-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={userProfile?.phone || "-"}
                disabled
                className="w-full p-3 rounded-lg border border-purple-200 bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg
                ${
                  selectedService === service.name
                    ? "bg-purple-600 text-white shadow-purple-200"
                    : "bg-white hover:bg-purple-50 border border-purple-100"
                }`}
              onClick={() => setSelectedService(service.name)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <p
                  className={`text-sm ${
                    selectedService === service.name
                      ? "text-purple-100"
                      : "text-gray-500"
                  }`}
                >
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
            <label className="flex items-center space-x-2 text-purple-800 font-medium mb-3">
              <Calendar className="w-5 h-5" />
              <span>เลือกวันที่:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
            <label className="flex items-center space-x-2 text-purple-800 font-medium mb-3">
              <Clock className="w-5 h-5" />
              <span>เลือกเวลา:</span>
            </label>
            <select 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">เลือกเวลา</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-purple-800 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6" />
            <span>สรุปการจอง</span>
          </h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex justify-between">
              <span className="font-medium">ผู้จอง:</span>
              <span>
                {userProfile
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "-"}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">เบอร์ติดต่อ:</span>
              <span>{userProfile?.phone || "-"}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">บริการ:</span>
              <span>{selectedService || "ยังไม่ได้เลือก"}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">วันที่:</span>
              <span>{selectedDate || "ยังไม่ได้เลือก"}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">เวลา:</span>
              <span>{selectedTime || "ยังไม่ได้เลือก"}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-medium text-lg
            transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormComplete()}
        >
          {isAuthenticated ? "ยืนยันการจอง" : "กรุณาเข้าสู่ระบบก่อนจองคิว"}
        </button>
      </div>
    </div>
  );
}