// Admin Dashboard Types

export type AdminRoleType = 'super_admin' | 'admin' | 'manager' | 'support';

export type ActivityType = 
  | 'user_created' |'user_updated' |'user_deleted' |'role_changed' |'permission_granted' |'permission_revoked' |'system_config_changed' |'data_export' |'backup_created';

export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'maintenance';

export interface AdminRole {
  id: string;
  userId: string;
  role: AdminRoleType;
  grantedBy?: string;
  grantedAt: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  id: string;
  role: AdminRoleType;
  resource: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  resourceType?: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface SystemHealthMetric {
  id: string;
  metricName: string;
  metricValue: number;
  metricUnit?: string;
  status: SystemStatus;
  thresholdWarning?: number;
  thresholdCritical?: number;
  description?: string;
  recordedAt: string;
  createdAt: string;
}

export interface UserManagementStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

export interface SystemHealthStats {
  overallStatus: SystemStatus;
  databaseConnections: number;
  apiResponseTime: number;
  storageUsage: number;
  activeSessions: number;
  errorRate: number;
}

export interface DataUsageStats {
  totalVehicles: number;
  activeReservations: number;
  completedReservations: number;
  totalRevenue: number;
  pendingPayments: number;
}