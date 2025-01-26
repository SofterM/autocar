import React from 'react';
import { motion } from 'framer-motion';

const services = [
  'Insurance', 'Battery', 'Alignment', 'Repair', 'Maintenance', 'Diagnosis',
  'Oil Change', 'Brake Service', 'Engine Tune-up', 'Inspection'
];

export default function ScrollingServices() {
  return (
    <div className="w-full overflow-hidden py-8 bg-gray-900/60 backdrop-blur-lg">
      <div className="flex whitespace-nowrap animate-scroll">
        {[...services, ...services].map((service, index) => (
          <motion.div
            key={index}
            className="inline-flex items-center mx-4"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <span className={`text-4xl font-bold ${index % 2 === 0 ? 'text-[#6C63FF]' : 'text-white/20'}`}>
              {service}
            </span>
            <span className="text-[#6C63FF] text-4xl mx-4">✦</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}