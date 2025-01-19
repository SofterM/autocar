'use client'

import React from 'react';
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
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  activeMenu?: string;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, activeMenu = 'แดชบอร์ด' }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const menuItems: MenuSection[] = [
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
          label: 'รายงาน',
          path: '/admin/reports',
        },
        { 
          icon: MessageSquare, 
          label: 'รีวิวและคะแนน',
          path: '/admin/reviews',
        },
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <aside 
      className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        min-h-screen bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Wrench className="h-6 w-6 text-indigo-600" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">PowerPuff</h1>
                <p className="text-sm font-medium text-gray-500">Auto Service</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {menuItems.map((section, index) => (
            <div key={index} className="space-y-3">
              {isSidebarOpen && (
                <p className="text-xs font-semibold text-gray-500 uppercase px-3">
                  {section.title}
                </p>
              )}
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    flex items-center gap-3 w-full p-3 rounded-xl
                    transition-all duration-200
                    ${item.label === activeMenu
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 ${item.label === activeMenu ? 'text-indigo-600' : 'text-gray-500'}`} />
                  {isSidebarOpen && (
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                  )}
                  {isSidebarOpen && item.label === activeMenu && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="text-sm font-medium">ออกจากระบบ</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;