'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  location: string;
  timezone: string;
  joinDate: string;
  lastLogin: string;
}

const UserProfileInteractive = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@supplychain.vision',
    role: 'Operations Manager',
    department: 'Supply Chain Operations',
    phone: '+1 (555) 123-4567',
    location: 'Chicago, IL',
    timezone: 'America/Chicago',
    joinDate: '2023-03-15',
    lastLogin: '2025-11-19T05:15:00'
  });

  const [editForm, setEditForm] = useState(userProfile);

  const handleSave = () => {
    setUserProfile(editForm);
    setIsEditing(false);
    // Here you would typically make an API call to update the profile
  };

  const handleCancel = () => {
    setEditForm(userProfile);
    setIsEditing(false);
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Icon name="UserIcon" size={32} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p className="text-muted-foreground">{userProfile.role}</p>
              <p className="text-sm text-muted-foreground">{userProfile.department}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="PencilIcon" size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Icon name="CheckIcon" size={16} />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Icon name="XMarkIcon" size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="CalendarIcon" size={20} className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">{formatJoinDate(userProfile.joinDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="ClockIcon" size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="font-medium text-foreground">{formatLastLogin(userProfile.lastLogin)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="GlobeAltIcon" size={20} className="text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Timezone</p>
                <p className="font-medium text-foreground">{userProfile.timezone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ) : (
              <p className="text-muted-foreground">{userProfile.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ) : (
              <p className="text-muted-foreground">{userProfile.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ) : (
              <p className="text-muted-foreground">{userProfile.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ) : (
              <p className="text-muted-foreground">{userProfile.phone}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
            <p className="text-muted-foreground">{userProfile.role}</p>
            <span className="text-xs text-muted-foreground">Contact administrator to change role</span>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Department</label>
            <p className="text-muted-foreground">{userProfile.department}</p>
            <span className="text-xs text-muted-foreground">Contact administrator to change department</span>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            ) : (
              <p className="text-muted-foreground">{userProfile.location}</p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
            {isEditing ? (
              <select
                value={editForm.timezone}
                onChange={(e) => setEditForm(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">GMT</option>
                <option value="Europe/Berlin">Central European Time</option>
                <option value="Asia/Tokyo">Japan Standard Time</option>
              </select>
            ) : (
              <p className="text-muted-foreground">{userProfile.timezone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="KeyIcon" size={20} className="text-yellow-600" />
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Last updated 30 days ago</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Change Password
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="DevicePhoneMobileIcon" size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Enabled via SMS</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              Manage
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="ComputerDesktopIcon" size={20} className="text-blue-600" />
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">3 active sessions</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              View Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInteractive;