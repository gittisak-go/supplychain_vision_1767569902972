'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import {
  UserManagementStats,
  SystemHealthStats,
  DataUsageStats,
  ActivityLog,
  AdminRole,
  AdminPermission,
} from '../../../types/admin.types';
import Header from '../../../components/common/Header';
import SidebarNavigation from '../../../components/common/SidebarNavigation';
import MobileNavigation from '../../../components/common/MobileNavigation';

type TabType = 'user-management' | 'system-health' | 'data-usage' | 'access-control';

export default function AdminDashboardInteractive() {
  const [activeTab, setActiveTab] = useState<TabType>('user-management');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // User Management State
  const [userStats, setUserStats] = useState<UserManagementStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  // System Health State
  const [systemHealth, setSystemHealth] = useState<SystemHealthStats | null>(null);
  
  // Data Usage State
  const [dataUsage, setDataUsage] = useState<DataUsageStats | null>(null);
  
  // Access Control State
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  
  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'user-management') {
        const [statsResult, usersResult] = await Promise.all([
          adminService.getUserManagementStats(),
          adminService.getAllUsers(),
        ]);

        if (statsResult.error) throw statsResult.error;
        if (usersResult.error) throw usersResult.error;

        setUserStats(statsResult.data);
        setUsers(usersResult.data ?? []);
      } else if (activeTab === 'system-health') {
        const healthResult = await adminService.getSystemHealthStats();
        if (healthResult.error) throw healthResult.error;
        setSystemHealth(healthResult.data);
      } else if (activeTab === 'data-usage') {
        const usageResult = await adminService.getDataUsageStats();
        if (usageResult.error) throw usageResult.error;
        setDataUsage(usageResult.data);
      } else if (activeTab === 'access-control') {
        const [rolesResult, permsResult] = await Promise.all([
          adminService.getAdminRoles(),
          adminService.getAdminPermissions(),
        ]);

        if (rolesResult.error) throw rolesResult.error;
        if (permsResult.error) throw permsResult.error;

        setAdminRoles(rolesResult.data ?? []);
        setPermissions(permsResult.data ?? []);
      }

      // Load activity logs for sidebar
      const logsResult = await adminService.getActivityLogs(10);
      if (!logsResult.error) {
        setActivityLogs(logsResult.data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('th-TH').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <SidebarNavigation />
        <MobileNavigation />
        
        <main className="flex-1 p-6 ml-0 lg:ml-64">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ดผู้ดูแลระบบ</h1>
            <p className="text-gray-600">จัดการผู้ใช้ ตรวจสอบสุขภาพระบบ และกำหนดการเข้าถึง</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ผู้ใช้ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : formatNumber(userStats?.totalUsers)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{formatNumber(userStats?.newUsersThisWeek)} สัปดาห์นี้
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">สถานะระบบ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : systemHealth?.overallStatus === 'healthy' ? 'ปกติ' : 'เตือน'}
                  </p>
                  <p className={`text-xs mt-1 ${systemHealth?.overallStatus === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {formatNumber(systemHealth?.activeSessions)} เซสชันใช้งาน
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  systemHealth?.overallStatus === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    systemHealth?.overallStatus === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">การใช้งานข้อมูล</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : `${formatNumber(dataUsage?.activeReservations)} จอง`}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formatNumber(dataUsage?.totalVehicles)} รถทั้งหมด
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">รายได้ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : `฿${formatNumber(dataUsage?.totalRevenue)}`}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {formatNumber(dataUsage?.pendingPayments)} รอชำระ
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'user-management' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  จัดการผู้ใช้
                </button>
                <button
                  onClick={() => setActiveTab('system-health')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'system-health' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  สุขภาพระบบ
                </button>
                <button
                  onClick={() => setActiveTab('data-usage')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'data-usage' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  การใช้งานข้อมูล
                </button>
                <button
                  onClick={() => setActiveTab('access-control')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'access-control' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  การควบคุมการเข้าถึง
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                <>
                  {/* User Management Tab */}
                  {activeTab === 'user-management' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">รายการผู้ใช้</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ผู้ใช้
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                อีเมล
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                โทรศัพท์
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                วันที่สร้าง
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                การดำเนินการ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {users?.map((user) => (
                              <tr key={user?.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-medium">
                                        {user?.fullName?.charAt(0) ?? 'U'}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {user?.fullName ?? 'ไม่ระบุชื่อ'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user?.phone ?? '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{formatDate(user?.createdAt)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">แก้ไข</button>
                                  <button className="text-red-600 hover:text-red-900">ลบ</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* System Health Tab */}
                  {activeTab === 'system-health' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">ตัวชี้วัดสุขภาพระบบ</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">การเชื่อมต่อฐานข้อมูล</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('healthy')}`}>
                              ปกติ
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(systemHealth?.databaseConnections)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">connections</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">เวลาตอบสนอง API</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('healthy')}`}>
                              ปกติ
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(systemHealth?.apiResponseTime)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">ms</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">การใช้พื้นที่จัดเก็บ</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              (systemHealth?.storageUsage ?? 0) > 80 ? 'warning' : 'healthy'
                            )}`}>
                              {(systemHealth?.storageUsage ?? 0) > 80 ? 'เตือน' : 'ปกติ'}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(systemHealth?.storageUsage)}%
                          </p>
                          <p className="text-sm text-gray-500 mt-1">of total storage</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">เซสชันที่ใช้งาน</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('healthy')}`}>
                              ปกติ
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(systemHealth?.activeSessions)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">sessions</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Usage Tab */}
                  {activeTab === 'data-usage' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">สถิติการใช้งานข้อมูล</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">รถยนต์</h3>
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatNumber(dataUsage?.totalVehicles)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">รถทั้งหมดในระบบ</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">การจอง</h3>
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatNumber(dataUsage?.activeReservations)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            การจองที่ใช้งาน (เสร็จสิ้น: {formatNumber(dataUsage?.completedReservations)})
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">รายได้</h3>
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">
                            ฿{formatNumber(dataUsage?.totalRevenue)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            รอชำระ: {formatNumber(dataUsage?.pendingPayments)} รายการ
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Access Control Tab */}
                  {activeTab === 'access-control' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">บทบาทและสิทธิ์</h2>
                      <div className="space-y-6">
                        {/* Admin Roles Section */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">บทบาทผู้ดูแลระบบ</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            {adminRoles?.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">ไม่มีข้อมูลบทบาทผู้ดูแลระบบ</p>
                            ) : (
                              <div className="space-y-3">
                                {adminRoles?.map((role) => (
                                  <div key={role?.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        role?.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                        role?.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                        role?.role === 'manager'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {role?.role}
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        {formatDate(role?.grantedAt)}
                                      </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      role?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {role?.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Permissions Matrix */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">สิทธิ์การเข้าถึง</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    บทบาท
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ทรัพยากร
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สร้าง
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    อ่าน
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    แก้ไข
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ลบ
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {permissions?.map((perm) => (
                                  <tr key={perm?.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        perm?.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                        perm?.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                        perm?.role === 'manager'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {perm?.role}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {perm?.resource}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      {perm?.canCreate ? (
                                        <span className="text-green-600">✓</span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      {perm?.canRead ? (
                                        <span className="text-green-600">✓</span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      {perm?.canUpdate ? (
                                        <span className="text-green-600">✓</span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      {perm?.canDelete ? (
                                        <span className="text-green-600">✓</span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Activity Logs Sidebar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
            <div className="space-y-4">
              {activityLogs?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีกิจกรรม</p>
              ) : (
                activityLogs?.map((log) => (
                  <div key={log?.id} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{log?.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log?.userName ?? log?.userEmail} • {formatDate(log?.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}