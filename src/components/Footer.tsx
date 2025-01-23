'use client'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Clock, Car, Shield, Wrench } from 'lucide-react'
import Image from 'next/image'

const Footer = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <footer className="relative mt-auto border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      <div className="absolute inset-0 backdrop-blur-xl" />

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative container mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <motion.div variants={item} className="lg:col-span-1">
            <div className="flex flex-col h-full">
              <Image
                src="/LOGO.png"
                alt="Auto Service"
                width={120}
                height={30}
                className="mb-4"
              />
              <p className="text-gray-400 text-sm mb-4">
                ศูนย์บริการและซ่อมบำรุงยานยนต์ครบวงจร มาตรฐานระดับสากล
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#6C63FF] transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={item}>
            <h3 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#6C63FF]" />
              บริการของเรา
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Car, text: 'ตรวจเช็คสภาพรถยนต์' },
                { icon: Wrench, text: 'ซ่อมเครื่องยนต์' },
                { icon: Shield, text: 'รับประกันอะไหล่แท้' },
                { icon: Wrench, text: 'ซ่อมช่วงล่าง' },
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2 group"
                >
                  <item.icon className="w-4 h-4 text-[#6C63FF] group-hover:text-[#6C63FF]" />
                  <span className="text-gray-400 text-sm group-hover:text-[#6C63FF] transition-colors cursor-pointer">
                    {item.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={item}>
            <h3 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#6C63FF]" />
              ติดต่อเรา
            </h3>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: '123 ถ.พระราม 9 เขตห้วยขวาง กรุงเทพฯ' },
                { icon: Phone, text: '02-XXX-XXXX (สายด่วน)' },
                { icon: Phone, text: '02-XXX-XXXX (ฝ่ายขาย)' },
                { icon: Mail, text: 'contact@example.com' }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2 group"
                >
                  <item.icon className="w-4 h-4 text-[#6C63FF] group-hover:text-[#6C63FF]" />
                  <span className="text-gray-400 text-sm group-hover:text-[#6C63FF] transition-colors cursor-pointer">
                    {item.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Opening Hours */}
          <motion.div variants={item}>
            <h3 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6C63FF]" />
              เวลาทำการ
            </h3>
            <ul className="space-y-3">
              {[
                { day: 'จันทร์ - ศุกร์', time: '08:00 - 17:00' },
                { day: 'เสาร์', time: '08:00 - 12:00' },
                { day: 'อาทิตย์', time: 'ปิดทำการ' },
                { day: 'วันหยุดนักขัตฤกษ์', time: 'ปิดทำการ' }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  whileHover={{ x: 2 }}
                  className="group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm group-hover:text-[#6C63FF] transition-colors">
                      {item.day}
                    </span>
                    <span className="text-gray-400 text-sm group-hover:text-[#6C63FF] transition-colors">
                      {item.time}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="flex flex-col md:flex-row justify-between items-center border-t border-white/10 mt-8 pt-6 text-sm text-gray-400"
        >
          <p>&copy; {new Date().getFullYear()} Auto Care Service Center. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {['นโยบายความเป็นส่วนตัว', 'เงื่อนไขการใช้งาน'].map((text, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ y: -1 }}
                className="hover:text-[#6C63FF] transition-colors"
              >
                {text}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}

export default Footer