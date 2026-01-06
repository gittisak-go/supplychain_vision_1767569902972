import { supabase } from '../lib/supabase/client';
import { 
  Team, 
  TeamMember, 
  TeamActivity, 
  WorkspaceConfiguration, 
  TeamPermission,
  TeamMemberRole,
  TeamActivityType
} from '../types/team.types';

interface TeamResponse {
  data: Team[] | null;
  error: Error | null;
}

interface SingleTeamResponse {
  data: Team | null;
  error: Error | null;
}

interface TeamMembersResponse {
  data: TeamMember[] | null;
  error: Error | null;
}

interface TeamActivitiesResponse {
  data: TeamActivity[] | null;
  error: Error | null;
}

interface WorkspaceConfigResponse {
  data: WorkspaceConfiguration[] | null;
  error: Error | null;
}

interface TeamPermissionsResponse {
  data: TeamPermission[] | null;
  error: Error | null;
}

export const teamService = {
  // Teams
  async getUserTeams(userId: string): Promise<TeamResponse> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner(user_id, is_active)
        `)
        .eq('team_members.user_id', userId)
        .eq('team_members.is_active', true);

      if (error) throw error;

      const teams = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return { data: teams, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async getTeamById(teamId: string): Promise<SingleTeamResponse> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;

      const team: Team = {
        id: data.id,
        name: data.name,
        description: data.description,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: team, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createTeam(name: string, description: string, createdBy: string): Promise<SingleTeamResponse> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) throw error;

      const team: Team = {
        id: data.id,
        name: data.name,
        description: data.description,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: team, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Team Members
  async getTeamMembers(teamId: string): Promise<TeamMembersResponse> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_profiles(id, email, full_name, avatar_url)
        `)
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const members = (data || []).map((row: any) => ({
        id: row.id,
        teamId: row.team_id,
        userId: row.user_id,
        role: row.role as TeamMemberRole,
        addedBy: row.added_by,
        joinedAt: row.joined_at,
        isActive: row.is_active,
        user: row.user ? {
          id: row.user.id,
          email: row.user.email,
          fullName: row.user.full_name,
          avatarUrl: row.user.avatar_url
        } : undefined
      }));

      return { data: members, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async addTeamMember(
    teamId: string, 
    userId: string, 
    role: TeamMemberRole, 
    addedBy: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          added_by: addedBy
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  async updateMemberRole(
    memberId: string, 
    role: TeamMemberRole
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  async removeMember(memberId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  // Team Activities
  async getTeamActivities(teamId: string, limit: number = 50): Promise<TeamActivitiesResponse> {
    try {
      const { data, error } = await supabase
        .from('team_activities')
        .select(`
          *,
          user:user_profiles(full_name, email)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const activities = (data || []).map((row: any) => ({
        id: row.id,
        teamId: row.team_id,
        userId: row.user_id,
        activityType: row.activity_type as TeamActivityType,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at,
        user: row.user ? {
          fullName: row.user.full_name,
          email: row.user.email
        } : undefined
      }));

      return { data: activities, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createActivity(
    teamId: string,
    userId: string,
    activityType: TeamActivityType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('team_activities')
        .insert({
          team_id: teamId,
          user_id: userId,
          activity_type: activityType,
          description,
          metadata
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  // Workspace Configurations
  async getWorkspaceConfigurations(teamId: string): Promise<WorkspaceConfigResponse> {
    try {
      const { data, error } = await supabase
        .from('workspace_configurations')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      const configs = (data || []).map((row: any) => ({
        id: row.id,
        teamId: row.team_id,
        configKey: row.config_key,
        configValue: row.config_value,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return { data: configs, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateWorkspaceConfig(
    teamId: string,
    configKey: string,
    configValue: Record<string, any>,
    updatedBy: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('workspace_configurations')
        .upsert({
          team_id: teamId,
          config_key: configKey,
          config_value: configValue,
          updated_by: updatedBy
        }, {
          onConflict: 'team_id,config_key'
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  // Team Permissions
  async getMemberPermissions(memberId: string): Promise<TeamPermissionsResponse> {
    try {
      const { data, error } = await supabase
        .from('team_permissions')
        .select('*')
        .eq('member_id', memberId);

      if (error) throw error;

      const permissions = (data || []).map((row: any) => ({
        id: row.id,
        teamId: row.team_id,
        memberId: row.member_id,
        resource: row.resource,
        canView: row.can_view,
        canEdit: row.can_edit,
        canDelete: row.can_delete,
        canShare: row.can_share,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return { data: permissions, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updatePermissions(
    memberId: string,
    resource: string,
    permissions: {
      canView?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
      canShare?: boolean;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('team_permissions')
        .upsert({
          member_id: memberId,
          resource,
          can_view: permissions.canView,
          can_edit: permissions.canEdit,
          can_delete: permissions.canDelete,
          can_share: permissions.canShare
        }, {
          onConflict: 'member_id,resource'
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
};