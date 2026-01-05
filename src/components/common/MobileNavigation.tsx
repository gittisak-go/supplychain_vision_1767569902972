'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useNavigation } from './SidebarNavigation';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  tooltip: string;
}

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

interface MobileNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavigationItem = React.memo(({ item, isActive, onClick }: MobileNavigationItemProps) => {
  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={`
        flex items-center px-6 py-4 border-b border-gray-800 transition-smooth
        ${isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }
      `}
    >
      <Icon 
        name={item.icon as any}
        size={24}
        className="flex-shrink-0"
      />
      <div className="ml-4">
        <div className="font-medium text-base">{item.label}</div>
        <div className="text-sm opacity-75 mt-1">{item.tooltip}</div>
      </div>
    </Link>
  );
});

MobileNavigationItem.displayName = 'MobileNavigationItem';

const MobileNavigation = () => {
  const { activeRoute, mobileMenuOpen, setMobileMenuOpen } = useNavigation();

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-999 lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Mobile Navigation Overlay */}
      <nav className="fixed inset-y-0 left-0 w-80 max-w-full bg-secondary z-1000 lg:hidden overflow-y-auto">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="TruckIcon" size={24} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">SupplyChain</span>
              <span className="text-gray-400 text-sm">Vision</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="py-4">
          {navigationItems.map((item) => (
            <MobileNavigationItem
              key={item.path}
              item={item}
              isActive={activeRoute === item.path}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="text-center text-gray-400 text-sm">
            © 2025 GtsAlpha :Ghost Tracker
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;