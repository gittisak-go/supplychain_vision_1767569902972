-- Location: supabase/migrations/20260105004026_admin_dashboard.sql
-- Schema Analysis: Existing car rental system with user_profiles, vehicles, reservations, payments, maintenance
-- Integration Type: Extension - Adding admin dashboard functionality
-- Dependencies: user_profiles (existing)

-- 1. TYPES - Admin-specific enums
CREATE TYPE public.admin_role_type AS ENUM ('super_admin', 'admin', 'manager', 'support');
CREATE TYPE public.activity_type AS ENUM ('user_created', 'user_updated', 'user_deleted', 'role_changed', 'permission_granted', 'permission_revoked', 'system_config_changed', 'data_export', 'backup_created');
CREATE TYPE public.system_status AS ENUM ('healthy', 'warning', 'critical', 'maintenance');

-- 2. CORE TABLES - Admin roles and permissions

-- Admin roles table
CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.admin_role_type DEFAULT 'support'::public.admin_role_type,
    granted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Admin permissions table
CREATE TABLE public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.admin_role_type NOT NULL,
    resource TEXT NOT NULL,
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, resource)
);

-- Activity logs table for tracking admin actions
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    activity_type public.activity_type NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- System health metrics table
CREATE TABLE public.system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    status public.system_status DEFAULT 'healthy'::public.system_status,
    threshold_warning NUMERIC,
    threshold_critical NUMERIC,
    description TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON public.admin_roles(role);
CREATE INDEX idx_admin_roles_is_active ON public.admin_roles(is_active);
CREATE INDEX idx_admin_permissions_role ON public.admin_permissions(role);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_system_health_metrics_metric_name ON public.system_health_metrics(metric_name);
CREATE INDEX idx_system_health_metrics_status ON public.system_health_metrics(status);
CREATE INDEX idx_system_health_metrics_recorded_at ON public.system_health_metrics(recorded_at);

-- 4. FUNCTIONS (Before RLS policies)

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = auth.uid() 
    AND ar.is_active = true
    AND ar.role IN ('super_admin', 'admin')
)
$$;

-- Function to check specific role
CREATE OR REPLACE FUNCTION public.has_admin_role(required_role public.admin_role_type)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = auth.uid() 
    AND ar.is_active = true
    AND ar.role = required_role
)
$$;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_desc TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        activity_desc := 'Created new record in ' || TG_TABLE_NAME;
    ELSIF TG_OP = 'UPDATE' THEN
        activity_desc := 'Updated record in ' || TG_TABLE_NAME;
    ELSIF TG_OP = 'DELETE' THEN
        activity_desc := 'Deleted record from ' || TG_TABLE_NAME;
    END IF;

    INSERT INTO public.activity_logs (user_id, activity_type, resource_type, description)
    VALUES (
        auth.uid(),
        'system_config_changed'::public.activity_type,
        TG_TABLE_NAME,
        activity_desc
    );

    RETURN NEW;
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Admin roles policies - Only super admins can manage roles
CREATE POLICY "super_admins_manage_admin_roles"
ON public.admin_roles
FOR ALL
TO authenticated
USING (public.has_admin_role('super_admin'::public.admin_role_type))
WITH CHECK (public.has_admin_role('super_admin'::public.admin_role_type));

CREATE POLICY "users_view_own_admin_role"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin permissions policies - Only admins can view/manage
CREATE POLICY "admins_manage_permissions"
ON public.admin_permissions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Activity logs policies - Admins can view all, users can view their own
CREATE POLICY "admins_view_all_activity_logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "users_view_own_activity_logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "authenticated_create_activity_logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- System health metrics policies - Only admins can manage
CREATE POLICY "admins_manage_system_health_metrics"
ON public.system_health_metrics
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. TRIGGERS
CREATE TRIGGER trigger_update_admin_roles_updated_at
    BEFORE UPDATE ON public.admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_updated_at();

CREATE TRIGGER trigger_update_admin_permissions_updated_at
    BEFORE UPDATE ON public.admin_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_updated_at();

-- 8. MOCK DATA
DO $$
DECLARE
    existing_admin_id UUID;
    existing_user_id UUID;
BEGIN
    -- Get existing admin user from user_profiles
    SELECT id INTO existing_admin_id FROM public.user_profiles 
    WHERE email = 'admin@rungrojcarrental.com' LIMIT 1;
    
    -- Get existing regular user
    SELECT id INTO existing_user_id FROM public.user_profiles 
    WHERE email = 'customer@rungrojcarrental.com' LIMIT 1;

    -- Create admin role for existing admin user
    IF existing_admin_id IS NOT NULL THEN
        INSERT INTO public.admin_roles (user_id, role, notes, granted_by)
        VALUES 
            (existing_admin_id, 'super_admin'::public.admin_role_type, 'System administrator with full access', existing_admin_id);
    END IF;

    -- Insert default admin permissions
    INSERT INTO public.admin_permissions (role, resource, can_create, can_read, can_update, can_delete)
    VALUES
        ('super_admin'::public.admin_role_type, 'users', true, true, true, true),
        ('super_admin'::public.admin_role_type, 'vehicles', true, true, true, true),
        ('super_admin'::public.admin_role_type, 'reservations', true, true, true, true),
        ('super_admin'::public.admin_role_type, 'payments', true, true, true, true),
        ('super_admin'::public.admin_role_type, 'system_settings', true, true, true, true),
        ('admin'::public.admin_role_type, 'users', false, true, true, false),
        ('admin'::public.admin_role_type, 'vehicles', true, true, true, true),
        ('admin'::public.admin_role_type, 'reservations', true, true, true, false),
        ('admin'::public.admin_role_type, 'payments', false, true, false, false),
        ('manager'::public.admin_role_type, 'vehicles', true, true, true, false),
        ('manager'::public.admin_role_type, 'reservations', true, true, true, false),
        ('support'::public.admin_role_type, 'users', false, true, false, false),
        ('support'::public.admin_role_type, 'reservations', false, true, true, false);

    -- Insert sample activity logs
    IF existing_admin_id IS NOT NULL THEN
        INSERT INTO public.activity_logs (user_id, activity_type, resource_type, description, metadata)
        VALUES
            (existing_admin_id, 'user_created'::public.activity_type, 'user_profiles', 'Created new customer account', '{"user_type": "customer"}'::jsonb),
            (existing_admin_id, 'role_changed'::public.activity_type, 'admin_roles', 'Granted admin role to user', '{"role": "admin"}'::jsonb),
            (existing_admin_id, 'system_config_changed'::public.activity_type, 'system_settings', 'Updated maintenance schedule settings', '{"setting": "auto_maintenance_alerts", "value": true}'::jsonb);
    END IF;

    -- Insert sample system health metrics
    INSERT INTO public.system_health_metrics (metric_name, metric_value, metric_unit, status, threshold_warning, threshold_critical, description)
    VALUES
        ('database_connections', 45, 'connections', 'healthy'::public.system_status, 80, 95, 'Number of active database connections'),
        ('api_response_time', 125, 'ms', 'healthy'::public.system_status, 500, 1000, 'Average API response time'),
        ('storage_usage', 45, 'percent', 'healthy'::public.system_status, 80, 90, 'Database storage utilization'),
        ('active_sessions', 128, 'sessions', 'healthy'::public.system_status, 500, 800, 'Number of active user sessions'),
        ('error_rate', 0.2, 'percent', 'healthy'::public.system_status, 5, 10, 'Application error rate');

END $$;