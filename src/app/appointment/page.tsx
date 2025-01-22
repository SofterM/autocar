'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Car, User } from 'lucide-react';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export default function AppointmentPage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [carInfo, setCarInfo] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    problemDescription: ''
  });

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        // Assuming the API returns an array and we want the first user
        setUserProfile(data[0]);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const services = [
    {
      name: 'ตรวจเช็คทั่วไป',
      icon: '🔍',
      description: 'ตรวจสอบสภาพรถโดยรวม ระบบเครื่องยนต์ และความปลอดภัย'
    },
    {
      name: 'เปลี่ยนน้ำมันเครื่อง',
      icon: '🔧',
      description: 'บริการเปลี่ยนถ่ายน้ำมันเครื่องพร้อมตรวจเช็คระบบหล่อลื่น'
    },
    {
      name: 'ซ่อมเฉพาะจุด',
      icon: '⚡',
      description: 'แก้ไขปัญหาเฉพาะจุดตามที่ลูกค้าแจ้ง'
    },
    {
      name: 'เช็คระยะ',
      icon: '📊',
      description: 'บริการตรวจเช็คตามระยะทางที่กำหนด'
    },
    {
      name: 'บริการด่วน',
      icon: '🏃',
      description: 'บริการซ่อมด่วนสำหรับปัญหาเร่งด่วน'
    },
    {
      name: 'ระบบเบรก',
      icon: '🛑',
      description: 'ตรวจสอบและซ่อมระบบเบรก ผ้าเบรก จานเบรก'
    },
    {
      name: 'ระบบแอร์',
      icon: '❄️',
      description: 'ตรวจเช็ค ซ่อม และเติมน้ำยาแอร์'
    },
    {
      name: 'ระบบไฟฟ้า',
      icon: '⚡',
      description: 'ตรวจสอบและซ่อมระบบไฟฟ้าทั้งหมดในรถ'
    },
    {
      name: 'ช่วงล่าง',
      icon: '🔩',
      description: 'ตรวจสอบและซ่อมระบบช่วงล่าง โช้ค สปริง'
    },
    {
      name: 'เปลี่ยนยาง',
      icon: '🛞',
      description: 'บริการเปลี่ยนยาง ถ่วงล้อ และตั้งศูนย์'
    },
    {
      name: 'แบตเตอรี่',
      icon: '🔋',
      description: 'ตรวจสอบและเปลี่ยนแบตเตอรี่'
    },
    {
      name: 'ระบบระบายความร้อน',
      icon: '🌡️',
      description: 'ตรวจเช็คระบบหม้อน้ำและระบบระบายความร้อน'
    },
    {
      name: 'เคลมประกัน',
      icon: '📝',
      description: 'บริการซ่อมและประสานงานเคลมประกัน'
    },
    {
      name: 'ฟิล์มและกระจก',
      icon: '🪟',
      description: 'ติดตั้งและซ่อมแซมฟิล์มกระจก'
    },
    {
      name: 'เครื่องเสียง',
      icon: '🔊',
      description: 'ติดตั้งและซ่อมแซมระบบเครื่องเสียง'
    }
  ];

  const handleCarInfoChange = (field: string, value: string) => {
    setCarInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormComplete = () => {
    return (
      selectedService &&
      selectedDate &&
      selectedTime &&
      carInfo.brand &&
      carInfo.model &&
      carInfo.year &&
      carInfo.licensePlate &&
      carInfo.problemDescription &&
      userProfile // Add check for user profile
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-purple-800 text-center">
          จองคิวบริการ
        </h1>

        {/* User Profile Section */}
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
                value={userProfile?.first_name || ''}
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
                value={userProfile?.last_name || ''}
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
                value={userProfile?.email || ''}
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
                value={userProfile?.phone || ''}
                disabled
                className="w-full p-3 rounded-lg border border-purple-200 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Car Information Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 mb-12">
          <h2 className="text-xl font-bold mb-6 text-purple-800 flex items-center space-x-2">
            <Car className="w-6 h-6" />
            <span>ข้อมูลรถ</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                ยี่ห้อรถ
              </label>
              <input
                type="text"
                value={carInfo.brand}
                onChange={(e) => handleCarInfoChange('brand', e.target.value)}
                className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="เช่น Toyota, Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                รุ่น
              </label>
              <input
                type="text"
                value={carInfo.model}
                onChange={(e) => handleCarInfoChange('model', e.target.value)}
                className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="เช่น Camry, Civic"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                ปีรถ
              </label>
              <input
                type="text"
                value={carInfo.year}
                onChange={(e) => handleCarInfoChange('year', e.target.value)}
                className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="เช่น 2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                ทะเบียนรถ
              </label>
              <input
                type="text"
                value={carInfo.licensePlate}
                onChange={(e) => handleCarInfoChange('licensePlate', e.target.value)}
                className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="เช่น กข 1234 กรุงเทพ"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-purple-800 mb-2">
                รายละเอียดปัญหา
              </label>
              <textarea
                value={carInfo.problemDescription}
                onChange={(e) => handleCarInfoChange('problemDescription', e.target.value)}
                className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                placeholder="กรุณาระบุอาการหรือปัญหาของรถที่ต้องการให้ตรวจสอบ"
              />
            </div>
          </div>
        </div>
          
        {/* Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {services.map((service) => (
            <div
              key={service.name}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg
                ${
                  selectedService === service.name
                    ? 'bg-purple-600 text-white shadow-purple-200'
                    : 'bg-white hover:bg-purple-50 border border-purple-100'
                }`}
              onClick={() => setSelectedService(service.name)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <p className={`text-sm ${
                  selectedService === service.name ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Date and Time Selection */}
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

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-purple-800 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6" />
            <span>สรุปการจอง</span>
          </h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex justify-between">
              <span className="font-medium">ผู้จอง:</span>
              <span>{userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'ยังไม่ได้โหลดข้อมูล'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">เบอร์ติดต่อ:</span>
              <span>{userProfile?.phone || 'ยังไม่ได้โหลดข้อมูล'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">ยี่ห้อรถ:</span>
              <span>{carInfo.brand || 'ยังไม่ได้ระบุ'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">รุ่น:</span>
              <span>{carInfo.model || 'ยังไม่ได้ระบุ'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">ปีรถ:</span>
              <span>{carInfo.year || 'ยังไม่ได้ระบุ'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">ทะเบียน:</span>
              <span>{carInfo.licensePlate || 'ยังไม่ได้ระบุ'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">บริการ:</span>
              <span>{selectedService || 'ยังไม่ได้เลือก'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">วันที่:</span>
              <span>{selectedDate || 'ยังไม่ได้เลือก'}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">เวลา:</span>
              <span>{selectedTime || 'ยังไม่ได้เลือก'}</span>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
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