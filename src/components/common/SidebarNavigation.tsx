'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppIcon } from '../ui/AppIcon';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  tooltip: string;
}

interface NavigationContextType {
  activeRoute: string;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const value = {
    activeRoute: pathname,
    sidebarCollapsed,
    mobileMenuOpen,
    setSidebarCollapsed,
    setMobileMenuOpen,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

const navigationItems: NavigationItem[] = [
  {
    label: 'แดชบอร์ด',
    path: '/supply-chain-overview',
    icon: 'ChartBarIcon',
    tooltip: 'ภาพรวมผู้บริหารและศูนย์ควบคุมสำหรับการดำเนินงานทั่วโลก'
  },
  {
    label: 'ติดตามสด',
    path: '/real-time-tracking',
    icon: 'MapIcon',
    tooltip: 'การประสานงานการดำเนินงานแบบเรียลไทม์และการตรวจสอบการจัดส่ง'
  },
  {
    label: 'วิเคราะห์ท่าเรือ',
    path: '/port-analytics',
    icon: 'BuildingOfficeIcon',
    tooltip: 'การตรวจสอบกำลังการผลิตและความแออัดเฉพาะทาง'
  },
  {
    label: 'ประสิทธิภาพ',
    path: '/performance-analytics',
    icon: 'PresentationChartLineIcon',
    tooltip: 'การวิเคราะห์เชิงกลยุทธ์และการติดตาม KPI'
  },
  {
    label: 'จัดการยานพาหนะ',
    path: '/fleet-management-dashboard',
    icon: 'TruckIcon',
    tooltip: 'จัดการและติดตามยานพาหนะทั้งหมด'
  },
  {
    label: 'จัดการการจอง',
    path: '/car-reservations-management',
    icon: 'CalendarIcon',
    tooltip: 'จัดการการจองและคำสั่งซื้อ'
  },
  {
    label: 'Team Hub',
    path: '/team-collaboration-hub',
    icon: 'UserGroupIcon',
    tooltip: 'ทำงานร่วมกันกับทีม'
  },
  {
    label: 'AI ผู้ช่วย',
    path: '/ai-assistant-chat',
    icon: 'ChatBubbleLeftRightIcon',
    tooltip: 'แชทกับ AI ผู้ช่วยอัจฉริยะ'
  },
  {
    label: 'แดชบอร์ดผู้ดูแล',
    path: '/admin-dashboard',
    icon: 'Cog6ToothIcon',
    tooltip: 'จัดการระบบและผู้ใช้งาน'
  },
  {
    label: 'เงื่อนไขและนโยบาย',
    path: '/terms-and-privacy-modal',
    icon: 'DocumentTextIcon',
    tooltip: 'เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว'
  },
  {
    label: 'เมนูขั้นสูง',
    path: '/enhanced-navigation-sidebar',
    icon: 'Bars3Icon',
    tooltip: 'เมนูนำทางแบบขั้นสูง'
  },
  {
    label: 'โปรไฟล์',
    path: '/user-profile',
    icon: 'UserCircleIcon',
    tooltip: 'จัดการโปรไฟล์ของคุณ'
  },
  {
    label: 'การตั้งค่า',
    path: '/user-preferences',
    icon: 'AdjustmentsHorizontalIcon',
    tooltip: 'ตั้งค่าความชอบของคุณ'
  },
  {
    label: 'บันทึกกิจกรรม',
    path: '/activity-log',
    icon: 'ClockIcon',
    tooltip: 'ดูประวัติกิจกรรมของคุณ'
  }
];

export default function SidebarNavigation({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/landing-page');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <AppIcon name="ChartBarIcon" className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GtsAlpha MCP</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <AppIcon name="XMarkIcon" className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600' :'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <AppIcon name={item.icon} className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <AppIcon name="UserIcon" className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">ผู้ใช้งาน</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <AppIcon name="ArrowRightOnRectangleIcon" className="h-5 w-5" />
                <span className="font-medium">ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}