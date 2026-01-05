import { supabase } from '../lib/supabase/client';
import {
  AdminRole,
  AdminPermission,
  ActivityLog,
  SystemHealthMetric,
  UserManagementStats,
  SystemHealthStats,
  DataUsageStats,
  AdminRoleType,
  ActivityType,
} from '../types/admin.types';

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export const adminService = {
  // User Management
  async getUserManagementStats(): Promise<ServiceResponse<UserManagementStats>> {
    try {
      // Get total users
      const { count: totalUsers, error: totalError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get active users (users with recent activity)
      const { count: activeUsers, error: activeError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (activeError) throw activeError;

      // Get new users today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: newUsersToday, error: todayError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      if (todayError) throw todayError;

      // Get new users this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      const { count: newUsersThisWeek, error: weekError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString());

      if (weekError) throw weekError;

      return {
        data: {
          totalUsers: totalUsers ?? 0,
          activeUsers: activeUsers ?? 0,
          newUsersToday: newUsersToday ?? 0,
          newUsersThisWeek: newUsersThisWeek ?? 0,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch user stats'),
      };
    }
  },

  async getAllUsers(): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data ?? []).map((row: any) => ({
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          phone: row.phone,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch users'),
      };
    }
  },

  // Admin Roles Management
  async getAdminRoles(): Promise<ServiceResponse<AdminRole[]>> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data ?? []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          role: row.role,
          grantedBy: row.granted_by,
          grantedAt: row.granted_at,
          notes: row.notes,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch admin roles'),
      };
    }
  },

  async createAdminRole(userId: string, role: AdminRoleType, notes?: string): Promise<ServiceResponse<AdminRole>> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .insert({
          user_id: userId,
          role: role,
          notes: notes,
          granted_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          role: data.role,
          grantedBy: data.granted_by,
          grantedAt: data.granted_at,
          notes: data.notes,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to create admin role'),
      };
    }
  },

  async updateAdminRole(roleId: string, updates: { isActive?: boolean; notes?: string }): Promise<ServiceResponse<AdminRole>> {
    try {
      const updateData: any = {};
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('admin_roles')
        .update(updateData)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          role: data.role,
          grantedBy: data.granted_by,
          grantedAt: data.granted_at,
          notes: data.notes,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to update admin role'),
      };
    }
  },

  // Admin Permissions Management
  async getAdminPermissions(): Promise<ServiceResponse<AdminPermission[]>> {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;

      return {
        data: (data ?? []).map((row: any) => ({
          id: row.id,
          role: row.role,
          resource: row.resource,
          canCreate: row.can_create,
          canRead: row.can_read,
          canUpdate: row.can_update,
          canDelete: row.can_delete,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch permissions'),
      };
    }
  },

  // Activity Logs
  async getActivityLogs(limit: number = 50): Promise<ServiceResponse<ActivityLog[]>> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        data: (data ?? []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          activityType: row.activity_type,
          resourceType: row.resource_type,
          resourceId: row.resource_id,
          description: row.description,
          metadata: row.metadata,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          createdAt: row.created_at,
          userName: row.user?.full_name,
          userEmail: row.user?.email,
        })),
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch activity logs'),
      };
    }
  },

  async createActivityLog(
    activityType: ActivityType,
    description: string,
    options?: {
      resourceType?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ServiceResponse<ActivityLog>> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.data.user.id,
          activity_type: activityType,
          resource_type: options?.resourceType,
          resource_id: options?.resourceId,
          description: description,
          metadata: options?.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          activityType: data.activity_type,
          resourceType: data.resource_type,
          resourceId: data.resource_id,
          description: data.description,
          metadata: data.metadata,
          ipAddress: data.ip_address,
          userAgent: data.user_agent,
          createdAt: data.created_at,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to create activity log'),
      };
    }
  },

  // System Health Monitoring
  async getSystemHealthStats(): Promise<ServiceResponse<SystemHealthStats>> {
    try {
      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const metrics = data ?? [];
      
      const getLatestMetric = (name: string): number => {
        const metric = metrics.find((m: any) => m.metric_name === name);
        return metric?.metric_value ?? 0;
      };

      const determineOverallStatus = (): 'healthy' | 'warning' | 'critical' | 'maintenance' => {
        const criticalMetrics = metrics.filter((m: any) => m.status === 'critical');
        const warningMetrics = metrics.filter((m: any) => m.status === 'warning');
        
        if (criticalMetrics.length > 0) return 'critical';
        if (warningMetrics.length > 1) return 'warning';
        return 'healthy';
      };

      return {
        data: {
          overallStatus: determineOverallStatus(),
          databaseConnections: getLatestMetric('database_connections'),
          apiResponseTime: getLatestMetric('api_response_time'),
          storageUsage: getLatestMetric('storage_usage'),
          activeSessions: getLatestMetric('active_sessions'),
          errorRate: getLatestMetric('error_rate'),
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch system health stats'),
      };
    }
  },

  async getSystemHealthMetrics(): Promise<ServiceResponse<SystemHealthMetric[]>> {
    try {
      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data ?? []).map((row: any) => ({
          id: row.id,
          metricName: row.metric_name,
          metricValue: row.metric_value,
          metricUnit: row.metric_unit,
          status: row.status,
          thresholdWarning: row.threshold_warning,
          thresholdCritical: row.threshold_critical,
          description: row.description,
          recordedAt: row.recorded_at,
          createdAt: row.created_at,
        })),
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch system metrics'),
      };
    }
  },

  // Data Usage Analytics
  async getDataUsageStats(): Promise<ServiceResponse<DataUsageStats>> {
    try {
      // Get total vehicles
      const { count: totalVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      if (vehiclesError) throw vehiclesError;

      // Get active reservations
      const { count: activeReservations, error: activeError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'active']);

      if (activeError) throw activeError;

      // Get completed reservations
      const { count: completedReservations, error: completedError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Get total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('payment_status', 'completed');

      if (revenueError) throw revenueError;

      const totalRevenue = (revenueData ?? []).reduce((sum: number, row: any) => 
        sum + (parseFloat(row.amount) || 0), 0
      );

      // Get pending payments
      const { count: pendingPayments, error: pendingError } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      if (pendingError) throw pendingError;

      return {
        data: {
          totalVehicles: totalVehicles ?? 0,
          activeReservations: activeReservations ?? 0,
          completedReservations: completedReservations ?? 0,
          totalRevenue: Math.round(totalRevenue),
          pendingPayments: pendingPayments ?? 0,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch data usage stats'),
      };
    }
  },
};