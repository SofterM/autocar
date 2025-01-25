'use client'

import React, { useState, useEffect } from "react";
import { User, Key, Phone, Mail } from "lucide-react";
import { motion } from 'framer-motion';
import StarryBackground from '@/components/StarryBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserProfile(user);
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.firstName.length < 2) {
      newErrors.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'เบอร์โทรไม่ถูกต้อง';
    }

    if (formData.newPassword || formData.currentPassword) {
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร';
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'กรุณาระบุรหัสผ่านปัจจุบัน';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null
      };

      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccessMessage('อัพเดทข้อมูลสำเร็จ');
      setFormData(prev => ({ 
        ...prev, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      }));
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <StarryBackground />
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <motion.div 
            className="max-w-2xl mx-auto bg-gray-900/95 backdrop-blur-lg p-8 rounded-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold mb-6 text-white">ตั้งค่าโปรไฟล์</h1>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                {successMessage}
              </div>
            )}

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ชื่อ
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    นามสกุล
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h2 className="text-xl font-semibold mb-4 text-white">เปลี่ยนรหัสผ่าน</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      รหัสผ่านปัจจุบัน
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      รหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#6C63FF] text-white py-3 rounded-lg font-medium
                  transition-all duration-300 hover:bg-[#5B54FF] focus:ring-4 focus:ring-[#6C63FF]/20
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </form>
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}