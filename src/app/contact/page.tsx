'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Facebook, Send, Map } from 'lucide-react';
import StarryBackground from '@/components/StarryBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ContactInfo {
 company_name: string;
 tax_id: string;
 facebook: string;
 line: string;
 email: string;
 technician_phone: string;
 manager_phone: string;
 address: string;
}

export default function ContactPage() {
 const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
   async function fetchContactInfo() {
     try {
       setIsLoading(true);
       const response = await fetch('/api/contact-channels');
       const data = await response.json();
       if (data.length > 0) {
         setContactInfo(data[0]);
       }
     } catch (error) {
       console.error('Error:', error);
     } finally {
       setIsLoading(false);
     }
   }
   fetchContactInfo();
 }, []);

 return (
   <div className="flex flex-col min-h-screen">
     <StarryBackground />
     <div className="relative flex-1">
       <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
       <Navbar />
       
       <main className="flex-1 container mx-auto px-4 py-24">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-6xl mx-auto"
         >
           <div className="text-center mb-16">
             <motion.h1 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-5xl font-bold text-white mb-6"
             >
               ติดต่อเรา
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-gray-400 text-lg"
             >
               พร้อมให้บริการและตอบคำถามทุกความต้องการของคุณ
             </motion.p>
           </div>

           {isLoading ? (
             <div className="flex justify-center items-center min-h-[400px]">
               <div className="animate-spin h-8 w-8 border-4 border-[#6C63FF] border-t-transparent rounded-full" />
             </div>
           ) : contactInfo && (
             <div className="space-y-12">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
               >
                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                     <div className="flex items-start gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                         <Building2 className="w-6 h-6 text-[#6C63FF]" />
                       </div>
                       <div>
                         <h3 className="text-xl font-semibold text-white mb-2">{contactInfo.company_name}</h3>
                         <p className="text-gray-400">เลขประจำตัวผู้เสียภาษี: {contactInfo.tax_id}</p>
                       </div>
                     </div>
                     
                     <div className="flex items-start gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                         <Mail className="w-6 h-6 text-[#6C63FF]" />
                       </div>
                       <div>
                         <h3 className="text-lg font-semibold text-white mb-2">อีเมล</h3>
                         <a href={`mailto:${contactInfo.email}`} className="text-[#6C63FF] hover:underline">
                           {contactInfo.email}
                         </a>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-6">
                     <div className="flex items-start gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                         <Phone className="w-6 h-6 text-[#6C63FF]" />
                       </div>
                       <div>
                         <h3 className="text-lg font-semibold text-white mb-3">เบอร์ติดต่อ</h3>
                         <div className="space-y-2">
                           <p className="text-gray-400">
                             <span className="text-sm text-gray-500">ฝ่ายช่าง:</span><br />
                             {contactInfo.technician_phone}
                           </p>
                           <p className="text-gray-400">
                             <span className="text-sm text-gray-500">ผู้จัดการ:</span><br />
                             {contactInfo.manager_phone}
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </motion.div>

               <div className="grid md:grid-cols-3 gap-6">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[#6C63FF]/50 transition-all duration-300"
                 >
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                       <MapPin className="w-6 h-6 text-[#6C63FF]" />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-white mb-2">ที่อยู่</h3>
                       <p className="text-gray-400">{contactInfo.address}</p>
                     </div>
                   </div>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[#6C63FF]/50 transition-all duration-300"
                 >
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                       <Facebook className="w-6 h-6 text-[#6C63FF]" />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-white mb-2">Facebook</h3>
                       <a 
                         href={contactInfo.facebook}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-[#6C63FF] hover:underline"
                       >
                         {contactInfo.facebook}
                       </a>
                     </div>
                   </div>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[#6C63FF]/50 transition-all duration-300"
                 >
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                       <Send className="w-6 h-6 text-[#6C63FF]" />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-white mb-2">Line</h3>
                       <p className="text-gray-400">{contactInfo.line}</p>
                     </div>
                   </div>
                 </motion.div>
               </div>

               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 className="bg-gray-800 p-8 rounded-2xl border border-gray-700 mt-8"
               >
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                     <Map className="w-6 h-6 text-[#6C63FF]" />
                   </div>
                   <h3 className="text-xl font-semibold text-white">แผนที่</h3>
                 </div>
                 <div className="aspect-video rounded-xl overflow-hidden">
                   <iframe
                     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3..."
                     width="100%"
                     height="100%"
                     style={{ border: 0 }}
                     allowFullScreen
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                   />
                 </div>
               </motion.div>
             </div>
           )}
         </motion.div>
       </main>
     </div>
     <Footer />
   </div>
 );
}