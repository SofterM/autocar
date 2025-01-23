"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const user = JSON.parse(storedUser);
        setUserProfile(user);
      } catch (error) {
        setError("กรุณาเข้าสู่ระบบอีกครั้ง");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const isFormComplete = () => {
    return selectedService && selectedDate && selectedTime && userProfile;
  };

  const handleSubmit = async () => {
    try {
      if (!userProfile || !isFormComplete()) return;

      const appointmentData = {
        user_id: userProfile.id,
        service: selectedService,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        status: "pending",
      };

      const token = localStorage.getItem("token");
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
      alert(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการจองคิว"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-800">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full mx-4">
          <div className="text-red-600 text-center mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

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
                value={userProfile?.first_name || ""}
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
                value={userProfile?.last_name || ""}
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
                value={userProfile?.email || ""}
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
                value={userProfile?.phone || ""}
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
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
            <label className="flex items-center space-x-2 text-purple-800 font-medium mb-3">
              <Clock className="w-5 h-5" />
              <span>เลือกเวลา:</span>
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : "ยังไม่ได้โหลดข้อมูล"}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">เบอร์ติดต่อ:</span>
              <span>{userProfile?.phone || "ยังไม่ได้โหลดข้อมูล"}</span>
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
          ยืนยันการจอง
        </button>
      </div>
    </div>
  );
}
