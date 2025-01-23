'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Users,
  Package,
  BarChart3,
  MessageSquare,
  LogOut,
  Wrench,
  ChevronRight,
  X,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeMenu?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  activeMenu = 'แดชบอร์ด' 
}) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const menuItems = [
    {
      title: 'หน้าหลัก',
      items: [
        { 
          icon: LayoutDashboard, 
          label: 'แดชบอร์ด',
          path: '/admin',
        },
        { 
          icon: Car, 
          label: 'จัดการงานซ่อม',
          path: '/admin/repairs',
        },
        { 
          icon: Users, 
          label: 'จัดการพนักงาน',
          path: '/admin/employees',
        },
      ]
    },
    {
      title: 'การจัดการ',
      items: [
        { 
          icon: Package, 
          label: 'คลังอะไหล่',
          path: '/admin/parts',
        },
        { 
          icon: BarChart3, 
          label: 'รายงานการเงิน',
          path: '/admin/reports',
        },
        { 
          icon: Calendar, 
          label: 'การจองคิว',
          path: '/admin/appointment',
        },
        { 
          icon: MessageSquare, 
          label: 'ช่องทางการติดต่อ',
          path: '/admin/contacts',
        },
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed lg:sticky lg:top-0 z-30 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${isSidebarOpen ? 'w-64' : 'lg:w-20'} 
          h-screen bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out
          flex flex-col
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {/* Logo Section - Now clickable */}
          <button 
            onClick={() => handleNavigate('/')}
            className="p-6 border-b border-gray-200 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              {(isSidebarOpen || isMobile) && (
                <div className="text-left">
                  <h1 className="text-lg font-bold text-gray-900">PowerPuff</h1>
                  <p className="text-sm font-medium text-gray-700">Auto Service</p>
                </div>
              )}
            </div>
          </button>

          {/* Navigation Menus */}
          <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {menuItems.map((section, index) => (
              <div key={index} className="space-y-3">
                {(isSidebarOpen || isMobile) && (
                  <p className="text-xs font-semibold text-gray-900 uppercase px-3">
                    {section.title}
                  </p>
                )}
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigate(item.path)}
                    className={`
                      flex items-center gap-3 w-full p-3 rounded-lg
                      transition-all duration-200
                      ${item.label === activeMenu
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${item.label === activeMenu ? 'text-blue-600' : 'text-gray-700'}`} />
                    {(isSidebarOpen || isMobile) && (
                      <span className="flex-1 text-left text-sm">{item.label}</span>
                    )}
                    {(isSidebarOpen || isMobile) && item.label === activeMenu && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom Buttons - Fixed Position */}
          <div className="sticky bottom-0 p-4 mt-auto border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              {(isSidebarOpen || isMobile) && (
                <span className="text-sm font-medium">ออกจากระบบ</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;