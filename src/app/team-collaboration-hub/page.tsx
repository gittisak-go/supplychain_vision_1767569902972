'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { 
  Team, 
  TeamMember, 
  TeamActivity, 
  WorkspaceConfiguration,
  TeamMemberRole 
} from '../../types/team.types';
import SidebarNavigation from '../../components/common/SidebarNavigation';
import Header from '../../components/common/Header';
import MobileNavigation from '../../components/common/MobileNavigation';
import { 
  UserGroupIcon, 
  Cog6ToothIcon, 
  BellIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export default function TeamCollaborationHub() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [workspaceConfigs, setWorkspaceConfigs] = useState<WorkspaceConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadTeamData();
    }
  }, [user]);

  const loadTeamData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: teamsData, error: teamsError } = await teamService.getUserTeams(user.id);
      if (teamsError) throw teamsError;

      setTeams(teamsData || []);

      if (teamsData && teamsData.length > 0) {
        const firstTeam = teamsData[0];
        setSelectedTeam(firstTeam);
        await loadTeamDetails(firstTeam.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const [membersResult, activitiesResult, configsResult] = await Promise.all([
        teamService.getTeamMembers(teamId),
        teamService.getTeamActivities(teamId, 20),
        teamService.getWorkspaceConfigurations(teamId)
      ]);

      if (membersResult.error) throw membersResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (configsResult.error) throw configsResult.error;

      setTeamMembers(membersResult.data || []);
      setTeamActivities(activitiesResult.data || []);
      setWorkspaceConfigs(configsResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team details');
    }
  };

  const getRoleBadgeColor = (role: TeamMemberRole): string => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'operations_director': return 'bg-blue-100 text-blue-800';
      case 'operations_manager': return 'bg-green-100 text-green-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      case 'viewer': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: TeamMemberRole): string => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'operations_director': return 'Operations Director';
      case 'operations_manager': return 'Operations Manager';
      case 'member': return 'Member';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading team data...</p>
              </div>
            </div>
          </main>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </main>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Team Collaboration Hub</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage team members, roles, and workspace configurations
                  </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Invite Member
                </button>
              </div>
            </div>

            {/* Team Selector */}
            {teams.length > 0 && (
              <div className="mb-6">
                <select
                  value={selectedTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === e.target.value);
                    if (team) {
                      setSelectedTeam(team);
                      loadTeamDetails(team.id);
                    }
                  }}
                  className="block w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-semibold text-gray-900">{teamMembers?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {teamMembers?.filter(m => m?.isActive)?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                    <p className="text-2xl font-semibold text-gray-900">{teamActivities?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Cog6ToothIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Configurations</p>
                    <p className="text-2xl font-semibold text-gray-900">{workspaceConfigs?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Team Members Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {teamMembers?.map(member => (
                      <div key={member?.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {member?.user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member?.user?.fullName || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500">{member?.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member?.role)}`}>
                              {getRoleDisplayName(member?.role)}
                            </span>
                            {member?.role === 'operations_director' && (
                              <ShieldCheckIcon className="h-5 w-5 text-blue-600" title="Admin Access" />
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Joined {formatTimestamp(member?.joinedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workspace Configuration */}
                <div className="bg-white rounded-lg shadow mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Workspace Configuration</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {workspaceConfigs?.map(config => (
                        <div key={config?.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {config?.configKey?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                            </h3>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Edit
                            </button>
                          </div>
                          <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                            {JSON.stringify(config?.configValue, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Feed Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow sticky top-4">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Team Activity</h2>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {teamActivities?.map(activity => (
                      <div key={activity?.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <UserGroupIcon className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity?.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity?.user?.fullName} • {formatTimestamp(activity?.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!teamActivities || teamActivities?.length === 0) && (
                      <div className="px-6 py-8 text-center">
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}