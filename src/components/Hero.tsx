import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    { id: 1, image: '/banner1.png' },
    { id: 2, image: '/banner2.png' },
    { id: 3, image: '/banner3.png' }
  ];

  const handlePaginate = useCallback((newDirection: number) => {
    setCurrentIndex((prev) => (prev + newDirection + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      handlePaginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [handlePaginate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePaginate(-1);
    } else if (e.key === 'ArrowRight') {
      handlePaginate(1);
    }
  }, [handlePaginate]);

  return (
    <motion.div 
      className="w-full mx-auto mt-4 sm:mt-8 mb-4 sm:mb-8 px-2 sm:px-4 lg:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="relative h-48 xs:h-64 sm:h-80 md:h-96 lg:h-[28rem] max-w-[90rem] mx-auto overflow-hidden rounded-xl sm:rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800 shadow-xl">
        <div className="relative h-full">
          <motion.div
            className="absolute flex w-[300%]"
            animate={{
              x: `${-currentIndex * 33.333}%`
            }}
            transition={{
              x: { type: "spring", stiffness: 100, damping: 20 },
              duration: 0.6
            }}
          >
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                className="relative w-full h-48 xs:h-64 sm:h-80 md:h-96 lg:h-[28rem]"
                animate={{
                  scale: currentIndex === index ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.4
                }}
              >
                <img
                  src={banner.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="absolute inset-0 flex items-center justify-between p-2 sm:p-4 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePaginate(-1)}
            className="group p-2 sm:p-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800/70 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 group-hover:text-[#6C63FF]" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePaginate(1)}
            className="group p-2 sm:p-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800/70 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:text-[#6C63FF]" />
          </motion.button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
          {banners.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'bg-[#6C63FF] w-6 sm:w-8' 
                  : 'bg-gray-400/50 hover:bg-gray-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BannerSlider;