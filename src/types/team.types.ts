export type TeamMemberRole = 'owner' | 'operations_director' | 'operations_manager' | 'member' | 'viewer';

export type TeamActivityType = 
  | 'member_added' |'member_removed' |'role_changed' |'workspace_configured' |'dashboard_shared' |'permission_updated' |'team_created' |'team_updated';

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  addedBy?: string;
  joinedAt: string;
  isActive: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  activityType: TeamActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export interface WorkspaceConfiguration {
  id: string;
  teamId: string;
  configKey: string;
  configValue: Record<string, any>;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPermission {
  id: string;
  teamId: string;
  memberId: string;
  resource: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  recentActivities: number;
  pendingInvites: number;
}