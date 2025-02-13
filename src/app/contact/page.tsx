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
                className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-white mb-6"
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
                  className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Company Info Section */}
                    <div className="space-y-6">
                      <div className="group">
                        <div className="flex items-start gap-4 bg-black/20 p-6 rounded-xl border border-gray-700/50 hover:border-[#6C63FF]/50 transition-all duration-300">
                          <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center group-hover:bg-[#6C63FF]/20 transition-colors">
                            <Building2 className="w-6 h-6 text-[#6C63FF]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-[#6C63FF] mb-2 group-hover:text-[#ffffff] transition-colors">ชื่อบริษัท</h3>
                            <p className="text-gray-400">{contactInfo.company_name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="group">
                        <div className="flex items-start gap-4 bg-black/20 p-6 rounded-xl border border-gray-700/50 hover:border-[#6C63FF]/50 transition-all duration-300">
                          <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center group-hover:bg-[#6C63FF]/20 transition-colors">
                            <Mail className="w-6 h-6 text-[#6C63FF]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#6C63FF] mb-2 group-hover:text-[#ffffff] transition-colors">อีเมล</h3>
                            <a href={`mailto:${contactInfo.email}`} className="text-gray-200 mb-2 group-hover:text-[#6C63FF] transition-colors hover:underline">
                              {contactInfo.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Phone Section */}
                    <div className="space-y-6 w-full max-w-3xl">
                      <div className="group">
                        <div className="flex-1 basis-[60%] items-start gap-4 bg-black/20 p-6 rounded-xl border border-gray-700/50 hover:border-[#6C63FF]/50 transition-all duration-300">
                          <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center group-hover:bg-[#6C63FF]/20 transition-colors">
                            <Phone className="w-6 h-6 text-[#6C63FF]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#6C63FF] mb-3 group-hover:text-[hsl(0,0%,100%)] transition-colors">เบอร์ติดต่อ</h3>
                            <div className="space-y-2">
                              <div className="text-gray-200">
                                <span className="text-sm text-gray-500">ฝ่ายช่าง:</span>
                                <div className="flex items-center gap-2 group mt-1">
                                  <Phone className="w-4 h-4 text-[#6C63FF] group-hover:text-[#6C63FF]" />
                                  <span>{contactInfo.technician_phone}</span>
                                </div>
                              </div>
                              <div className="text-gray-200">
                                <span className="text-sm text-gray-500">ผู้จัดการ:</span>
                                <div className="flex items-center gap-2 group mt-1">
                                  <Phone className="w-4 h-4 text-[#6C63FF] group-hover:text-[#6C63FF]" />
                                  <span>{contactInfo.manager_phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: MapPin, title: 'ที่อยู่', content: contactInfo.address },
                    { 
                      icon: Facebook, 
                      title: 'Facebook', 
                      content: contactInfo.facebook,
                      isLink: true 
                    },
                    { icon: Send, title: 'Line', content: contactInfo.line, isLink: true }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      className="group bg-gradient-to-br from-bg-gray-900/95 backdrop-blur-lg p-6 rounded-xl border border-gray-700 mb-8"
                    >
                      <div className="flex items-start gap-4 text-[#6C63FF]">
                        <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center group-hover:bg-[#6C63FF]/20 transition-colors">
                          <item.icon className="w-6 h-6 text-[#6C63FF]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#6C63FF] transition-colors">
                            {item.title}
                          </h3>
                          {item.isLink ? (
                            <a 
                              href={item.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6C63FF] mb-2 group-hover:text-gray-200 transition-colors hover:underline"
                            >
                              {item.content}
                            </a>
                          ) : (
                            <p className="text-gray-400">{item.content}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Map Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700/50 shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                      <Map className="w-6 h-6 text-[#6C63FF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">แผนที่</h3>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden border border-gray-700/50">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1121.3480258256152!2d99.92550294634958!3d19.03072864864562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d83369a5508b77%3A0xab770e6e1fa013c6!2z4Lib4LmJ4Liy4Lii4Lir4LiZ4LmJ4Liy4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4Lie4Liw4LmA4Lii4Liy!5e0!3m2!1sth!2sth!4v1737944701230!5m2!1sth!2sth"
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