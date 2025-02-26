'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Timer, CheckCircle2, Package, Zap, TrendingUp } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

interface ServiceStat {
  icon: any
  title: string
  value: string
  unit: string
  bgGradient: string
  iconColor: string
  textColor: string
  borderColor: string
  growth?: string
}

interface Repair {
  id: number
  status: string
  final_cost?: number
  // อาจมี properties อื่นๆ แต่เราจะใช้แค่นี้ในโค้ดนี้
}

interface Part {
  id: number
  stock_quantity: number
  // อาจมี properties อื่นๆ แต่เราจะใช้แค่นี้ในโค้ดนี้
}

export default function EnhancedServiceStats() {
  // Animation for counting up numbers
  const [animatedValues, setAnimatedValues] = useState<Record<number, string>>({});
  
  // State for API data
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch repairs data
        const repairsResponse = await fetch('/api/repairs');
        if (!repairsResponse.ok) {
          throw new Error('Failed to fetch repairs data');
        }
        const repairsData = await repairsResponse.json();
        setRepairs(repairsData || []);

        // Fetch parts data
        const partsResponse = await fetch('/api/parts');
        if (!partsResponse.ok) {
          throw new Error('Failed to fetch parts data');
        }
        const partsData = await partsResponse.json();
        setParts(partsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics based on fetched data
  const totalRepairs = repairs.length;
  const inProgressRepairs = repairs.filter(repair => repair.status === 'in_progress').length;
  const completedRepairs = repairs.filter(repair => repair.status === 'completed').length;
  const totalPartsCount = parts.reduce((sum, part) => sum + part.stock_quantity, 0);

  // Create services array with real data
  const services: ServiceStat[] = [
    {
      icon: Wrench,
      title: "รายการซ่อมทั้งหมด",
      value: totalRepairs.toString(),
      unit: "รายการ",
      bgGradient: "from-[#6C63FF]/10 via-[#6C63FF]/5 to-[#6C63FF]/10",
      iconColor: "text-[#6C63FF]",
      textColor: "text-[#6C63FF]",
      borderColor: "border-[#6C63FF]/20",
      growth: "+15.2%"
    },
    {
      icon: Timer,
      title: "กำลังซ่อม",
      value: inProgressRepairs.toString(),
      unit: "รายการ",
      bgGradient: "from-[#6C63FF]/10 via-[#6C63FF]/5 to-[#6C63FF]/10",
      iconColor: "text-[#6C63FF]",
      textColor: "text-[#6C63FF]",
      borderColor: "border-[#6C63FF]/20",
      growth: "+7.8%"
    },
    {
      icon: CheckCircle2,
      title: "ซ่อมเสร็จแล้ว",
      value: completedRepairs.toString(),
      unit: "รายการ",
      bgGradient: "from-[#6C63FF]/10 via-[#6C63FF]/5 to-[#6C63FF]/10",
      iconColor: "text-[#6C63FF]",
      textColor: "text-[#6C63FF]",
      borderColor: "border-[#6C63FF]/20",
      growth: "+18.3%"
    },
    {
      icon: Package,
      title: "คลังอะไหล่",
      value: totalPartsCount.toString(),
      unit: "ชิ้น",
      bgGradient: "from-[#6C63FF]/10 via-[#6C63FF]/5 to-[#6C63FF]/10",
      iconColor: "text-[#6C63FF]",
      textColor: "text-[#6C63FF]",
      borderColor: "border-[#6C63FF]/20",
      growth: "+9.6%"
    }
  ]

  useEffect(() => {
    // Only run animation once when data is loaded and animation hasn't completed yet
    if (isLoading || animationComplete) return;

    const timeout = setTimeout(() => {
      services.forEach((service, index) => {
        const numericValue = parseInt(service.value.replace(/,/g, ''));
        const duration = 1500; // Animation duration in ms
        const steps = 20;
        const stepValue = numericValue / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          if (currentStep <= steps) {
            const currentValue = Math.round(stepValue * currentStep);
            setAnimatedValues(prev => ({
              ...prev,
              [index]: currentValue.toLocaleString()
            }));
            currentStep++;
          } else {
            clearInterval(interval);
            setAnimatedValues(prev => ({
              ...prev,
              [index]: service.value
            }));
            // Mark this animation as complete
            if (index === services.length - 1) {
              setAnimationComplete(true);
            }
          }
        }, duration / steps);
      });
    }, 500); // Delay before animation starts

    return () => clearTimeout(timeout);
  }, [isLoading, services, animationComplete]);

  // Calculate progress widths based on data
  const getProgressWidth = (index: number) => {
    switch (index) {
      case 0: // รายการซ่อมทั้งหมด
        return '80%';
      case 1: // กำลังซ่อม
        return isLoading ? '30%' : `${(inProgressRepairs / totalRepairs) * 100}%`;
      case 2: // ซ่อมเสร็จแล้ว
        return isLoading ? '75%' : `${(completedRepairs / totalRepairs) * 100}%`;
      case 3: // คลังอะไหล่
        return '55%';
      default:
        return '50%';
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#6C63FF]/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#6C63FF]/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-30" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gray-900/50 backdrop-blur-sm shadow-sm border border-gray-800/50">
            <Zap className="w-4 h-4 text-[#6C63FF]" />
            <span className="text-sm font-medium text-white">ข้อมูลการซ่อมล่าสุด</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">สถิติการให้บริการซ่อมบำรุง</h2>
          <p className="text-gray-400 text-lg">ข้อมูลสถิติการให้บริการซ่อมบำรุงรถยนต์และคลังอะไหล่คุณภาพสูง</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gray-900/40 backdrop-blur-sm bg-gradient-to-br ${service.bgGradient} rounded-xl p-6 border border-gray-800/50 shadow-xl transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1 hover:bg-gray-900/60 overflow-hidden`}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 rounded-tr-xl border-gray-700/30 -mt-2 -mr-2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 rounded-bl-xl border-gray-700/30 -mb-2 -ml-2" />
              </div>
              
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gray-900/60 flex items-center justify-center border ${service.borderColor} shadow-sm ${service.iconColor} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <service.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-gray-300 text-sm font-medium">{service.title}</h3>
                  </div>
                  
                  {service.growth && (
                    <div className="flex items-center gap-1 bg-gray-800/70 px-2 py-1 rounded-md">
                      <TrendingUp className="w-3 h-3 text-[#6C63FF]" />
                      <span className="text-xs font-medium text-white">{service.growth}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-baseline gap-1 mt-auto">
                  <span className={`text-5xl font-bold ${service.textColor}`}>
                    {isLoading ? '0' : (animatedValues[index] || '0')}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">{service.unit}</span>
                </div>
                
                {/* Progress indicator updated with real data */}
                <div className="mt-6 h-1 w-full bg-gray-800/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#6C63FF]"
                    style={{ width: getProgressWidth(index) }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}