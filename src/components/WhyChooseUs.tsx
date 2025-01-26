import React from 'react';
import { Settings2, ThumbsUp, ShieldCheck, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'ช่างผู้เชี่ยวชาญ',
    description: 'ทีมช่างของเราผ่านการฝึกอบรมและรับรองมาตรฐานระดับสูง พร้อมประสบการณ์กว่า 10 ปี ในการดูแลรถยนต์ทุกรุ่น ทุกยี่ห้อ',
    icon: Settings2
  },
  {
    title: 'บริการด้วยใจ',
    description: 'มุ่งมั่นสร้างความประทับใจในทุกขั้นตอนการบริการ ด้วยทีมงานที่พร้อมให้คำปรึกษาและดูแลรถของคุณอย่างใส่ใจในทุกรายละเอียด',
    icon: ThumbsUp
  },
  {
    title: 'รับประกันคืนเงิน',
    description: 'มั่นใจในคุณภาพการบริการ พร้อมรับประกันความพึงพอใจ หากไม่เป็นไปตามมาตรฐาน ยินดีคืนเงินเต็มจำนวนภายใน 7 วัน',
    icon: ShieldCheck
  },
  {
    title: 'อุปกรณ์คุณภาพสูง',
    description: 'ใช้เครื่องมือและอุปกรณ์ที่ทันสมัยได้มาตรฐานระดับโลก พร้อมอะไหล่แท้จากศูนย์ เพื่อประสิทธิภาพสูงสุดในการซ่อมบำรุง',
    icon: Gauge
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 space-y-6">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-[#6C63FF] font-medium tracking-wider inline-block"
            >
              /ทำไมต้องเลือกเรา?/
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-bold leading-tight text-white"
            >
              อะไรที่ทำให้เรา<br/>
              <span className="text-[#6C63FF] text-5xl lg:text-6xl">แตกต่าง?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-gray-400 text-lg leading-relaxed"
            >
              ด้วยประสบการณ์กว่า 10 ปี เรามุ่งมั่นพัฒนาการบริการให้ได้มาตรฐานสูงสุด 
              ทั้งด้านคุณภาพการซ่อมบำรุง ความปลอดภัย และความพึงพอใจของลูกค้า
            </motion.p>
          </div>

          <motion.div 
            className="lg:w-3/5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <motion.img 
              src="/mechanics.webp" 
              alt="Car Service"
              className="rounded-2xl w-full h-auto max-h-[600px] object-contain"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gray-900/90 backdrop-blur-xl p-6 rounded-xl border border-gray-800
                       hover:border-[#6C63FF]/50 hover:bg-gray-900/95 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4
                          bg-[#6C63FF]/10 group-hover:bg-[#6C63FF]/20 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-[#6C63FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-[#6C63FF] 
                         transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}