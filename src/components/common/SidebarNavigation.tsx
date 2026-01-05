'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

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
    label: 'Dashboard',
    path: '/supply-chain-overview',
    icon: 'ChartBarIcon',
    tooltip: 'Executive overview and command center for global operations'
  },
  {
    label: 'Live Tracking',
    path: '/real-time-tracking',
    icon: 'MapIcon',
    tooltip: 'Real-time operational coordination and shipment monitoring'
  },
  {
    label: 'Port Analytics',
    path: '/port-analytics',
    icon: 'BuildingOfficeIcon',
    tooltip: 'Specialized capacity and congestion monitoring'
  },
  {
    label: 'Performance',
    path: '/performance-analytics',
    icon: 'PresentationChartLineIcon',
    tooltip: 'Strategic analytics and KPI tracking'
  }
];

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavigationItem = React.memo(({ item, isActive, isCollapsed }: NavigationItemProps) => {
  return (
    <Link
      href={item.path}
      className={`
        group relative flex items-center h-12 px-4 rounded-lg transition-smooth
        ${isActive 
          ? 'bg-primary text-primary-foreground shadow-card' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }
      `}
      title={isCollapsed ? item.tooltip : undefined}
    >
      <Icon 
        name={item.icon as any}
        size={20}
        className="flex-shrink-0"
      />
      {!isCollapsed && (
        <span className="ml-3 font-medium text-sm">
          {item.label}
        </span>
      )}
      
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-smooth z-1100 whitespace-nowrap">
          {item.tooltip}
        </div>
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

interface UserProfileProps {
  isCollapsed: boolean;
}

const UserProfile = React.memo(({ isCollapsed }: UserProfileProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside, but not on navigation items
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!isCollapsed) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleSignOut = () => {
    // Handle logout logic here
    console.log('Signing out...');
    setDropdownOpen(false);
    // You can add actual authentication logic here
    router.push('/login'); // Redirect to login or handle auth state
  };

  // Handle navigation item clicks - keep dropdown open for navigation items
  const handleNavigationClick = (href: string) => {
    // Don't close dropdown for navigation items - let it stay open
    router.push(href);
  };

  const profileMenuItems = [
    {
      icon: 'UserIcon',
      label: 'โปรไฟล์',
      href: '/user-profile'
    },
    {
      icon: 'CogIcon',
      label: 'การตั้งค่า',
      href: '/user-preferences'
    },
    {
      icon: 'DocumentTextIcon',
      label: 'บันทึกกิจกรรม',
      href: '/activity-log'
    },
    {
      icon: 'ArrowRightOnRectangleIcon',
      label: 'ออกจากระบบ',
      onClick: handleSignOut
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={handleProfileClick}
        className={`
          group relative flex items-center p-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-smooth cursor-pointer
          ${isCollapsed ? 'justify-center' : ''}
          ${dropdownOpen ? 'bg-gray-800 text-white' : ''}
        `}
        title={isCollapsed ? 'Sarah Wilson - Operations Manager' : undefined}
      >
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-smooth">
          <Icon name="UserIcon" size={20} className="text-primary-foreground" />
        </div>
        
        {!isCollapsed && (
          <div className="ml-3 flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Sarah Wilson</div>
            <div className="text-xs text-gray-400 truncate">Operations Manager</div>
          </div>
        )}
        
        {!isCollapsed && (
          <Icon 
            name="ChevronDownIcon" 
            size={16} 
            className={`ml-2 text-gray-400 group-hover:text-gray-200 transition-smooth flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        )}
        
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-smooth z-1100 whitespace-nowrap">
            <div className="font-medium">Sarah Wilson</div>
            <div className="text-gray-400">Operations Manager</div>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && !isCollapsed && (
        <div className="mt-2 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
          {profileMenuItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <button
                  onClick={() => handleNavigationClick(item.href)}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-smooth text-left"
                >
                  <Icon name={item.icon as any} size={16} className="mr-3 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              ) : (
                <button
                  onClick={item.onClick}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-smooth"
                >
                  <Icon name={item.icon as any} size={16} className="mr-3 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

interface SidebarNavigationProps {
  className?: string;
}

const SidebarNavigation = ({ className = '' }: SidebarNavigationProps) => {
  const { activeRoute, sidebarCollapsed, setSidebarCollapsed } = useNavigation();

  return (
    <nav 
      className={`
        fixed left-0 top-0 h-full bg-secondary border-r border-gray-800 z-100 transition-layout
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
        hidden lg:flex flex-col
        ${className}
      `}
    >
      {/* Logo Section */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        {!sidebarCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="TruckIcon" size={20} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">SupplyChain</span>
              <span className="text-gray-400 text-xs">Vision</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Icon name="TruckIcon" size={20} className="text-primary-foreground" />
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="px-3 py-4 border-b border-gray-800">
        <UserProfile isCollapsed={sidebarCollapsed} />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            isActive={activeRoute === item.path}
            isCollapsed={sidebarCollapsed}
          />
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center h-10 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-smooth"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon 
            name={sidebarCollapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} 
            size={20} 
          />
        </button>
      </div>
    </nav>
  );
};

export default SidebarNavigation;