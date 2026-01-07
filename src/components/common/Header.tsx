'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import MobileNavToggle from './MobileNavToggle';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  className?: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  status: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

const Header = ({ className = '' }: HeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Mock notification data
  const notifications: Notification[] = [
    {
      id: '1',
      message: 'การจัดส่ง SH-2024-1234 ได้รับการส่งมอบสำเร็จแล้ว',
      timestamp: '2 นาทีที่แล้ว',
      status: 'success',
      read: false
    },
    {
      id: '2',
      message: 'แจ้งเตือนความล่าช้า: ตรวจพบความแออัดที่ท่าเรือลอสแองเจลิส',
      timestamp: '15 นาทีที่แล้ว',
      status: 'warning',
      read: false
    },
    {
      id: '3',
      message: 'การเพิ่มประสิทธิภาพเส้นทางเสร็จสมบูรณ์สำหรับการจัดส่งที่ใช้งานอยู่ 12 รายการ',
      timestamp: '1 ชั่วโมงที่แล้ว',
      status: 'info',
      read: true
    },
    {
      id: '4',
      message: 'วิกฤต: การหยุดชะงักจากสภาพอากาศส่งผลกระทบต่อเส้นทางเอเชีย-แปซิฟิก',
      timestamp: '2 ชั่วโมงที่แล้ว',
      status: 'error',
      read: true
    },
    {
      id: '5',
      message: 'ได้รับคำสั่งซื้อใหม่: คำสั่งซื้อ #ORD-2024-5678',
      timestamp: '3 ชั่วโมงที่แล้ว',
      status: 'success',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const handleOpenAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  const getStatusIcon = (status: Notification['status']) => {
    switch (status) {
      case 'success':
        return 'CheckCircleIcon';
      case 'warning':
        return 'ExclamationTriangleIcon';
      case 'error':
        return 'XCircleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  return (
    <>
      <header className={`bg-card border-b border-border shadow-card ${className}`}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Section - Mobile Nav Toggle */}
          <div className="flex items-center">
            <MobileNavToggle />
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="relative">
              <Icon 
                name="MagnifyingGlassIcon" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="ค้นหาการจัดส่ง คำสั่งซื้อ หรือหมายเลขติดตาม..."
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth"
              >
                <Icon name="BellIcon" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">การแจ้งเตือน</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {unreadCount} ยังไม่ได้อ่าน
                      </span>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-border hover:bg-muted transition-smooth cursor-pointer ${
                          !notification.read ? 'bg-muted/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Status Icon */}
                          <div className={`mt-0.5 ${getStatusColor(notification.status)}`}>
                            <Icon name={getStatusIcon(notification.status)} size={18} />
                          </div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-accent rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-border">
                    <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
                      ดูการแจ้งเตือนทั้งหมด
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-success/10 text-success rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-xs font-medium">สด</span>
            </div>

            {/* Auth Buttons - Show only when not logged in */}
            {!user && (
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => handleOpenAuthModal('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-smooth"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => handleOpenAuthModal('signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-smooth shadow-sm"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Header;