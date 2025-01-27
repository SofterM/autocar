'use client'
import React, { useState, useEffect } from "react";
import { User, Key, Phone, Mail, Save, Eye, EyeOff } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeTab === 'profile') {
      if (formData.firstName.length < 2) {
        newErrors.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
      }
      if (formData.lastName.length < 2) {
        newErrors.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร';
      }
      if (formData.phone && formData.phone.length < 10) {
        newErrors.phone = 'เบอร์โทรไม่ถูกต้อง';
      }
    } else {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'กรุณาระบุรหัสผ่านปัจจุบัน';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'กรุณาระบุรหัสผ่านใหม่';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร';
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
      const updateData = activeTab === 'profile' 
        ? {
            type: 'profile' as const,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || null
          }
        : {
            type: 'password' as const,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          };

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
      if (activeTab === 'profile') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserProfile(updatedUser);
      }
      
      setSuccessMessage(
        activeTab === 'profile' ? 'อัพเดทข้อมูลสำเร็จ' : 'เปลี่ยนรหัสผ่านสำเร็จ'
      );
      
      if (activeTab === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
      }

      setTimeout(() => setSuccessMessage(''), 3000);
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
    <div className="flex flex-col min-h-screen bg-gray-950">
      <StarryBackground />
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        <Navbar />
        <main className="container mx-auto px-4 py-12 mb-48">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">ตั้งค่าบัญชี</h1>
              <p className="text-gray-400">จัดการข้อมูลส่วนตัวและการตั้งค่าความปลอดภัย</p>
            </div>

            <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden shadow-xl">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'text-white border-b-2 border-[#6C63FF] bg-gray-800/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  ข้อมูลส่วนตัว
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'password'
                      ? 'text-white border-b-2 border-[#6C63FF] bg-gray-800/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>

              <div className="p-8">
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400"
                  >
                    {successMessage}
                  </motion.div>
                )}

                {errors.submit && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400"
                  >
                    {errors.submit}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === 'profile' ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            ชื่อ
                          </label>
                          <div className="relative group">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#6C63FF]" />
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full pl-10 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white 
                                focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all duration-200"
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
                          <div className="relative group">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#6C63FF]" />
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full pl-10 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white 
                                focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all duration-200"
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
                            className="w-full pl-10 p-3 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          เบอร์โทรศัพท์
                        </label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#6C63FF]" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white 
                              focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all duration-200"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          รหัสผ่านปัจจุบัน
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#6C63FF]" />
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white 
                              focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          รหัสผ่านใหม่
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#6C63FF]" />
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white 
                              focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ยืนยันรหัสผ่านใหม่
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#6C63FF]" />
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white 
                              focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#6C63FF] text-white py-3 px-6 rounded-lg font-medium
                      transition-all duration-300 hover:bg-[#5B54FF] focus:ring-4 focus:ring-[#6C63FF]/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Save className="h-5 w-5" />
                    {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
