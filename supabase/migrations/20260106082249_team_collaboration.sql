-- Location: supabase/migrations/20260106082249_team_collaboration.sql
-- Schema Analysis: Existing supply chain management system with user_profiles, admin_roles, and activity_logs
-- Integration Type: Addition - Adding team collaboration module
-- Dependencies: user_profiles (existing), activity_logs (existing)

-- 1. Create ENUM types for team collaboration
CREATE TYPE public.team_member_role AS ENUM ('owner', 'operations_director', 'operations_manager', 'member', 'viewer');
CREATE TYPE public.team_activity_type AS ENUM (
    'member_added',
    'member_removed', 
    'role_changed',
    'workspace_configured',
    'dashboard_shared',
    'permission_updated',
    'team_created',
    'team_updated'
);

-- 2. Create core tables

-- Teams/Workspaces table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team members with roles
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.team_member_role NOT NULL DEFAULT 'member'::public.team_member_role,
    added_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, user_id)
);

-- Team-specific activity tracking
CREATE TABLE public.team_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    activity_type public.team_activity_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Workspace configuration
CREATE TABLE public.workspace_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, config_key)
);

-- Team permissions
CREATE TABLE public.team_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, resource)
);

-- 3. Create indexes
CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_role ON public.team_members(role);
CREATE INDEX idx_team_activities_team_id ON public.team_activities(team_id);
CREATE INDEX idx_team_activities_user_id ON public.team_activities(user_id);
CREATE INDEX idx_team_activities_created_at ON public.team_activities(created_at);
CREATE INDEX idx_workspace_configurations_team_id ON public.workspace_configurations(team_id);
CREATE INDEX idx_team_permissions_member_id ON public.team_permissions(member_id);

-- 4. Create functions (MUST BE BEFORE RLS POLICIES)

-- Function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_uuid 
    AND tm.user_id = auth.uid()
    AND tm.is_active = true
)
$$;

-- Function to check if user has specific team role
CREATE OR REPLACE FUNCTION public.has_team_role(team_uuid UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_uuid 
    AND tm.user_id = auth.uid()
    AND tm.role::TEXT = required_role
    AND tm.is_active = true
)
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_team_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies

-- Teams policies
CREATE POLICY "users_view_teams_they_belong_to"
ON public.teams
FOR SELECT
TO authenticated
USING (public.is_team_member(id));

CREATE POLICY "users_create_teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "team_owners_update_teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (public.has_team_role(id, 'owner') OR public.has_team_role(id, 'operations_director'));

CREATE POLICY "team_owners_delete_teams"
ON public.teams
FOR DELETE
TO authenticated
USING (public.has_team_role(id, 'owner'));

-- Team members policies
CREATE POLICY "users_view_team_members"
ON public.team_members
FOR SELECT
TO authenticated
USING (public.is_team_member(team_id));

CREATE POLICY "team_managers_add_members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_team_role(team_id, 'owner') OR 
    public.has_team_role(team_id, 'operations_director') OR
    public.has_team_role(team_id, 'operations_manager')
);

CREATE POLICY "team_managers_update_members"
ON public.team_members
FOR UPDATE
TO authenticated
USING (
    public.has_team_role(team_id, 'owner') OR 
    public.has_team_role(team_id, 'operations_director')
);

CREATE POLICY "team_managers_remove_members"
ON public.team_members
FOR DELETE
TO authenticated
USING (
    public.has_team_role(team_id, 'owner') OR 
    public.has_team_role(team_id, 'operations_director')
);

-- Team activities policies
CREATE POLICY "team_members_view_activities"
ON public.team_activities
FOR SELECT
TO authenticated
USING (public.is_team_member(team_id));

CREATE POLICY "team_members_create_activities"
ON public.team_activities
FOR INSERT
TO authenticated
WITH CHECK (public.is_team_member(team_id) AND user_id = auth.uid());

-- Workspace configurations policies
CREATE POLICY "team_members_view_configurations"
ON public.workspace_configurations
FOR SELECT
TO authenticated
USING (public.is_team_member(team_id));

CREATE POLICY "team_managers_manage_configurations"
ON public.workspace_configurations
FOR ALL
TO authenticated
USING (
    public.has_team_role(team_id, 'owner') OR 
    public.has_team_role(team_id, 'operations_director') OR
    public.has_team_role(team_id, 'operations_manager')
)
WITH CHECK (
    public.has_team_role(team_id, 'owner') OR 
    public.has_team_role(team_id, 'operations_director') OR
    public.has_team_role(team_id, 'operations_manager')
);

-- Team permissions policies
CREATE POLICY "team_members_view_own_permissions"
ON public.team_permissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = member_id AND tm.user_id = auth.uid()
    )
);

CREATE POLICY "team_directors_manage_permissions"
ON public.team_permissions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = member_id 
        AND (public.has_team_role(tm.team_id, 'owner') OR public.has_team_role(tm.team_id, 'operations_director'))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = member_id 
        AND (public.has_team_role(tm.team_id, 'owner') OR public.has_team_role(tm.team_id, 'operations_director'))
    )
);

-- 7. Create triggers
CREATE TRIGGER trigger_update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_updated_at();

CREATE TRIGGER trigger_update_workspace_configurations_updated_at
    BEFORE UPDATE ON public.workspace_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_updated_at();

CREATE TRIGGER trigger_update_team_permissions_updated_at
    BEFORE UPDATE ON public.team_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_updated_at();

-- 8. Mock data for testing (only if users exist)
DO $$
DECLARE
    existing_user1_id UUID;
    existing_user2_id UUID;
    team_id UUID := gen_random_uuid();
    member1_id UUID;
    member2_id UUID;
BEGIN
    -- Get existing users from user_profiles (these should already exist from auth setup)
    SELECT id INTO existing_user1_id FROM public.user_profiles WHERE email = 'phongwut.w@gmail.com' LIMIT 1;
    SELECT id INTO existing_user2_id FROM public.user_profiles WHERE email = 'gittisakwannakeeree@gmail.com' LIMIT 1;
    
    -- Only create mock data if both users exist
    IF existing_user1_id IS NOT NULL AND existing_user2_id IS NOT NULL THEN
        -- Create team
        INSERT INTO public.teams (id, name, description, created_by)
        VALUES (team_id, 'Supply Chain Operations', 'Core operations team for supply chain management', existing_user2_id);
        
        -- Add team members
        INSERT INTO public.team_members (team_id, user_id, role, added_by)
        VALUES 
            (team_id, existing_user2_id, 'operations_director'::public.team_member_role, existing_user2_id)
        RETURNING id INTO member1_id;
        
        INSERT INTO public.team_members (team_id, user_id, role, added_by)
        VALUES 
            (team_id, existing_user1_id, 'operations_manager'::public.team_member_role, existing_user2_id)
        RETURNING id INTO member2_id;
        
        -- Add team activities
        INSERT INTO public.team_activities (team_id, user_id, activity_type, description, metadata)
        VALUES 
            (team_id, existing_user2_id, 'team_created'::public.team_activity_type, 'Created Supply Chain Operations team', '{"action": "team_creation"}'::jsonb),
            (team_id, existing_user2_id, 'member_added'::public.team_activity_type, 'Added Phongwut Wechabut as Operations Manager', '{"member_email": "phongwut.w@gmail.com", "role": "operations_manager"}'::jsonb);
        
        -- Add workspace configurations
        INSERT INTO public.workspace_configurations (team_id, config_key, config_value, updated_by)
        VALUES 
            (team_id, 'dashboard_layout', '{"columns": 12, "widgets": ["kpi", "alerts", "map", "charts"]}'::jsonb, existing_user2_id),
            (team_id, 'notification_preferences', '{"email": true, "push": true, "frequency": "realtime"}'::jsonb, existing_user2_id),
            (team_id, 'theme', '{"mode": "dark", "primaryColor": "#3b82f6"}'::jsonb, existing_user2_id);
        
        -- Add team permissions for directors (full access)
        INSERT INTO public.team_permissions (team_id, member_id, resource, can_view, can_edit, can_delete, can_share)
        VALUES 
            (team_id, member1_id, 'dashboard', true, true, true, true),
            (team_id, member1_id, 'analytics', true, true, true, true),
            (team_id, member1_id, 'team_settings', true, true, true, true);
        
        -- Add team permissions for managers (edit access)
        INSERT INTO public.team_permissions (team_id, member_id, resource, can_view, can_edit, can_delete, can_share)
        VALUES 
            (team_id, member2_id, 'dashboard', true, true, false, true),
            (team_id, member2_id, 'analytics', true, true, false, true),
            (team_id, member2_id, 'team_settings', true, false, false, false);
            
        RAISE NOTICE 'Team collaboration mock data created successfully';
    ELSE
        RAISE NOTICE 'Users not found. Please create users via authentication first before running team collaboration migration.';
        RAISE NOTICE 'Required users: phongwut.w@gmail.com, gittisakwannakeeree@gmail.com';
    END IF;
END $$;