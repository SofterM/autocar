'use client'

import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, User, FileText } from "lucide-react";
import { motion } from 'framer-motion';
import StarryBackground from '@/components/StarryBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CalendarBookings from "@/components/CalendarBookings";

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
 const [repairDetails, setRepairDetails] = useState("");
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
   return selectedService && selectedDate && selectedTime && repairDetails.trim() !== "";
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

     alert("จองคิวสำเร็จ!");
     setSelectedService("");
     setSelectedDate("");
     setSelectedTime("");
     setRepairDetails("");
   } catch (error) {
     console.error("Error creating appointment:", error);
     alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการจองคิว");
   }
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

 return (
   <div className="flex flex-col min-h-screen">
     <StarryBackground />
     <div className="relative flex-1">
       <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
       <Navbar />
       <main className="min-h-screen pb-32">
         <div className="p-8 max-w-4xl mx-auto">
           <motion.h1 
             className="text-3xl font-bold mb-8 text-white text-center"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
             จองคิวบริการ
           </motion.h1>

           <motion.div 
             className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700 mb-8"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <h2 className="text-xl font-bold mb-6 text-white flex items-center space-x-2">
               <User className="w-6 h-6 text-[#6C63FF]" />
               <span>ข้อมูลผู้จอง</span>
             </h2>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   ชื่อ
                 </label>
                 <input
                   type="text"
                   value={userProfile?.firstName || "-"}
                   disabled
                   className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
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
                   className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
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
                   className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
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
                   className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
                 />
               </div>
             </div>
           </motion.div>

           <motion.div 
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
           >
             {SERVICES.map((service) => (
               <div
                 key={service.name}
                 className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border ${
                   selectedService === service.name
                     ? "bg-[#6C63FF] text-white border-[#6C63FF]"
                     : "bg-gray-900/95 hover:border-[#6C63FF]/50 border-gray-700 text-white"
                 }`}
                 onClick={() => setSelectedService(service.name)}
               >
                 <div className="space-y-2">
                   <div className="flex items-center space-x-3">
                     <span className="text-2xl">{service.icon}</span>
                     <span className="font-medium">{service.name}</span>
                   </div>
                   <p className={`text-sm ${
                     selectedService === service.name
                       ? "text-gray-200"
                       : "text-gray-400"
                   }`}>
                     {service.description}
                   </p>
                 </div>
               </div>
             ))}
           </motion.div>

           <motion.div 
             className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700 mb-8"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
           >
             <label className="flex items-center space-x-2 text-white font-medium mb-3">
               <FileText className="w-5 h-5 text-[#6C63FF]" />
               <span>รายละเอียดการซ่อม:</span>
             </label>
             <textarea
               value={repairDetails}
               onChange={(e) => setRepairDetails(e.target.value)}
               placeholder="กรุณาระบุรายละเอียดการซ่อม หรืออาการของรถ"
               className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 min-h-32"
             />
           </motion.div>

           <motion.div 
             className="grid md:grid-cols-2 gap-8 mb-12"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
           >
             <div className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
               <label className="flex items-center space-x-2 text-white font-medium mb-3">
                 <Calendar className="w-5 h-5 text-[#6C63FF]" />
                 <span>เลือกวันที่:</span>
               </label>
               <input
                 type="date"
                 value={selectedDate}
                 onChange={handleDateChange}
                 min={new Date().toISOString().split('T')[0]}
                 max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                 className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50"
               />
             </div>
             <div className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
  <label className="flex items-center space-x-2 text-white font-medium mb-3">
    <Clock className="w-5 h-5 text-[#6C63FF]" />
    <span>เลือกเวลา:</span>
  </label>
  <select
    value={selectedTime}
    onChange={(e) => setSelectedTime(e.target.value)}
    className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50"
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
    <option value="17:00">17:00</option>
  </select>
</div>

           </motion.div>
          <div className="mb-12">
            <CalendarBookings/>
          </div>
           <motion.div 
             className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700 mb-8"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1 }}
           >
             <h2 className="text-xl font-bold mb-4 text-white flex items-center space-x-2">
               <CheckCircle className="w-6 h-6 text-[#6C63FF]" />
               <span>สรุปการจอง</span>
             </h2>
             <div className="space-y-3 text-gray-300">
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
                 <span className="font-medium">รายละเอียด:</span>
                 <span className="max-w-[70%] truncate">{repairDetails || "ยังไม่ได้ระบุ"}</span>
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
           </motion.div>

           <motion.button
             onClick={handleSubmit}
             className="w-full bg-[#6C63FF] text-white py-4 rounded-xl font-medium text-lg
               transition-all duration-300 hover:bg-[#5B54FF] focus:ring-4 focus:ring-[#6C63FF]/20
               disabled:opacity-50 disabled:cursor-not-allowed"
             disabled={!isFormComplete()}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.2 }}
           >
             {isAuthenticated ? "ยืนยันการจอง" : "กรุณาเข้าสู่ระบบก่อนจองคิว"}
           </motion.button>
         </div>
       </main>
     </div>
     
     <Footer />
   </div>
   
 );
}
                  