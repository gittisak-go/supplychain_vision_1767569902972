'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function EnhancedNavigationSidebarPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Dashboard',
    'Operations',
    'Collaboration',
    'Administration',
    'Account'
  ]);

  const navigationSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        { label: 'ภาพรวม Supply Chain', path: '/supply-chain-overview', icon: 'ChartBarIcon', badge: 3 },
        { label: 'วิเคราะห์ประสิทธิภาพ', path: '/performance-analytics', icon: 'PresentationChartLineIcon' },
        { label: 'วิเคราะห์ท่าเรือ', path: '/port-analytics', icon: 'BuildingOfficeIcon' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'ติดตามแบบเรียลไทม์', path: '/real-time-tracking', icon: 'MapIcon', badge: 5 },
        { label: 'จัดการยานพาหนะ', path: '/fleet-management-dashboard', icon: 'TruckIcon' },
        { label: 'จัดการการจอง', path: '/car-reservations-management', icon: 'CalendarIcon' }
      ]
    },
    {
      title: 'Collaboration',
      items: [
        { label: 'Team Hub', path: '/team-collaboration-hub', icon: 'UserGroupIcon', badge: 2 },
        { label: 'AI ผู้ช่วย Chat', path: '/ai-assistant-chat', icon: 'ChatBubbleLeftRightIcon' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'แดชบอร์ดผู้ดูแล', path: '/admin-dashboard', icon: 'Cog6ToothIcon' },
        { label: 'จัดการผู้ใช้', path: '/user-management', icon: 'UsersIcon' }
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'โปรไฟล์', path: '/user-profile', icon: 'UserCircleIcon' },
        { label: 'การตั้งค่า', path: '/user-preferences', icon: 'AdjustmentsHorizontalIcon' },
        { label: 'บันทึกกิจกรรม', path: '/activity-log', icon: 'ClockIcon' }
      ]
    }
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/landing-page');
  };

  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Enhanced Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-80'
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <Icon name="TruckIcon" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">GtsAlpha MCP</h1>
                <p className="text-xs text-gray-500">Supply Chain Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-smooth"
          >
            <Icon name={isCollapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={20} />
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Icon
                name="MagnifyingGlassIcon"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ค้นหาเมนู..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-2 py-1.5 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-smooth"
                >
                  <span>{section.title}</span>
                  <Icon
                    name={expandedSections.includes(section.title) ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    size={16}
                  />
                </button>
              )}

              {/* Section Items */}
              {(expandedSections.includes(section.title) || isCollapsed) && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center ${
                          isCollapsed ? 'justify-center' : 'justify-between'
                        } px-3 py-2.5 rounded-lg transition-smooth group ${
                          isActive
                            ? 'bg-blue-50 text-blue-600' :'text-gray-700 hover:bg-gray-100'
                        }`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            name={item.icon}
                            size={20}
                            className={isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                          />
                          {!isCollapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {!isCollapsed ? (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md">
                    <Icon name="UserIcon" size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">ผู้ใช้งาน</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-smooth border border-gray-200 shadow-sm"
                >
                  <Icon name="ArrowRightOnRectangleIcon" size={18} />
                  <span className="font-medium text-sm">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-smooth border border-gray-200 shadow-sm"
                title="ออกจากระบบ"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content - Preview */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="SparklesIcon" size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enhanced Navigation Sidebar</h1>
                <p className="text-gray-600">Comprehensive navigation with all platform features</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">✨ Key Features</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <Icon name="CheckCircleIcon" size={20} className="mr-2 mt-0.5" />
                    <span><strong>Organized Sections:</strong> Dashboard, Operations, Collaboration, Administration, Account</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="CheckCircleIcon" size={20} className="mr-2 mt-0.5" />
                    <span><strong>Search Functionality:</strong> Quick menu access with real-time filtering</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="CheckCircleIcon" size={20} className="mr-2 mt-0.5" />
                    <span><strong>Collapsible Design:</strong> Space-saving collapsed view with icon-only navigation</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="CheckCircleIcon" size={20} className="mr-2 mt-0.5" />
                    <span><strong>Notification Badges:</strong> Real-time alerts and counters for important items</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="CheckCircleIcon" size={20} className="mr-2 mt-0.5" />
                    <span><strong>Expandable Sections:</strong> Toggle visibility for better content organization</span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Dashboard Section</h4>
                  <p className="text-sm text-gray-600">Supply Chain Overview, Performance Analytics, Port Analytics</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Operations Section</h4>
                  <p className="text-sm text-gray-600">Real Time Tracking, Fleet Management, Reservations</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Collaboration Section</h4>
                  <p className="text-sm text-gray-600">Team Hub, AI Assistant Chat</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Account Section</h4>
                  <p className="text-sm text-gray-600">Profile, Preferences, Activity Log</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}