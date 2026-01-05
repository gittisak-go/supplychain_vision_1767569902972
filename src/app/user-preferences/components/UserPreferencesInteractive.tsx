'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    alertThreshold: 'low' | 'medium' | 'high';
    criticalAlerts: boolean;
    weeklyReports: boolean;
    maintenanceUpdates: boolean;
  };
  dashboard: {
    autoRefresh: boolean;
    refreshInterval: number;
    defaultView: string;
    compactMode: boolean;
    showTooltips: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    trackingCookies: boolean;
    dataExport: boolean;
  };
}

const UserPreferencesInteractive = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    language: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false,
      alertThreshold: 'medium',
      criticalAlerts: true,
      weeklyReports: true,
      maintenanceUpdates: false
    },
    dashboard: {
      autoRefresh: true,
      refreshInterval: 30,
      defaultView: '/supply-chain-overview',
      compactMode: false,
      showTooltips: true
    },
    privacy: {
      shareAnalytics: true,
      trackingCookies: true,
      dataExport: false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    // Here you would typically make an API call to save preferences
    setHasChanges(false);
    console.log('Saving preferences:', preferences);
  };

  const handleReset = () => {
    // Reset to default preferences
    setHasChanges(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Save/Reset Actions */}
      {hasChanges && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-yellow-400" />
              <p className="text-yellow-400">You have unsaved changes</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="SwatchIcon" size={20} className="mr-3" />
          Appearance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
            <div className="space-y-2">
              {[
                { value: 'light', label: 'Light', icon: 'SunIcon' },
                { value: 'dark', label: 'Dark', icon: 'MoonIcon' },
                { value: 'system', label: 'System', icon: 'ComputerDesktopIcon' }
              ].map((theme) => (
                <label key={theme.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={preferences.theme === theme.value}
                    onChange={(e) => updatePreference('theme', e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <Icon name={theme.icon as any} size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{theme.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => updatePreference('language', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Español</option>
              <option value="fr-FR">Français</option>
              <option value="de-DE">Deutsch</option>
              <option value="zh-CN">中文</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date Format</label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => updatePreference('dateFormat', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Time Format</label>
            <select
              value={preferences.timeFormat}
              onChange={(e) => updatePreference('timeFormat', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="BellIcon" size={20} className="mr-3" />
          Notifications
        </h3>
        
        <div className="space-y-6">
          {/* Notification Channels */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Notification Channels</h4>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email Notifications', icon: 'EnvelopeIcon' },
                { key: 'push', label: 'Push Notifications', icon: 'DevicePhoneMobileIcon' },
                { key: 'sms', label: 'SMS Notifications', icon: 'ChatBubbleLeftRightIcon' }
              ].map((channel) => (
                <label key={channel.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon name={channel.icon as any} size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{channel.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications[channel.key as keyof typeof preferences.notifications] as boolean}
                    onChange={(e) => updatePreference(`notifications.${channel.key}`, e.target.checked)}
                    className="text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Alert Threshold */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Alert Threshold</label>
            <select
              value={preferences.notifications.alertThreshold}
              onChange={(e) => updatePreference('notifications.alertThreshold', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="low">Low - All notifications</option>
              <option value="medium">Medium - Important notifications only</option>
              <option value="high">High - Critical notifications only</option>
            </select>
          </div>

          {/* Specific Notifications */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Specific Notifications</h4>
            <div className="space-y-3">
              {[
                { key: 'criticalAlerts', label: 'Critical System Alerts' },
                { key: 'weeklyReports', label: 'Weekly Performance Reports' },
                { key: 'maintenanceUpdates', label: 'Maintenance Updates' }
              ].map((notification) => (
                <label key={notification.key} className="flex items-center justify-between">
                  <span className="text-foreground">{notification.label}</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications[notification.key as keyof typeof preferences.notifications] as boolean}
                    onChange={(e) => updatePreference(`notifications.${notification.key}`, e.target.checked)}
                    className="text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="ChartBarIcon" size={20} className="mr-3" />
          Dashboard
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto Refresh */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Auto Refresh</span>
              <input
                type="checkbox"
                checked={preferences.dashboard.autoRefresh}
                onChange={(e) => updatePreference('dashboard.autoRefresh', e.target.checked)}
                className="text-primary focus:ring-primary"
              />
            </label>
            {preferences.dashboard.autoRefresh && (
              <div className="mt-2">
                <label className="block text-xs text-muted-foreground mb-1">Refresh Interval (seconds)</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={preferences.dashboard.refreshInterval}
                  onChange={(e) => updatePreference('dashboard.refreshInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Default Dashboard View</label>
            <select
              value={preferences.dashboard.defaultView}
              onChange={(e) => updatePreference('dashboard.defaultView', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="/supply-chain-overview">Supply Chain Overview</option>
              <option value="/real-time-tracking">Real-Time Tracking</option>
              <option value="/port-analytics">Port Analytics</option>
              <option value="/performance-analytics">Performance Analytics</option>
            </select>
          </div>

          {/* UI Options */}
          <div className="md:col-span-2">
            <h4 className="font-medium text-foreground mb-3">Interface Options</h4>
            <div className="space-y-3">
              {[
                { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing and use smaller elements' },
                { key: 'showTooltips', label: 'Show Tooltips', description: 'Display helpful tooltips on hover' }
              ].map((option) => (
                <div key={option.key} className="flex items-start justify-between">
                  <div>
                    <span className="text-foreground font-medium">{option.label}</span>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.dashboard[option.key as keyof typeof preferences.dashboard] as boolean}
                    onChange={(e) => updatePreference(`dashboard.${option.key}`, e.target.checked)}
                    className="text-primary focus:ring-primary mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="ShieldCheckIcon" size={20} className="mr-3" />
          Privacy & Data
        </h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'shareAnalytics', 
              label: 'Share Usage Analytics', 
              description: 'Help improve the platform by sharing anonymous usage data' 
            },
            { 
              key: 'trackingCookies', 
              label: 'Allow Tracking Cookies', 
              description: 'Enable cookies for personalized experience and analytics' 
            },
            { 
              key: 'dataExport', 
              label: 'Allow Data Export', 
              description: 'Enable automatic data exports for compliance reporting' 
            }
          ].map((option) => (
            <div key={option.key} className="flex items-start justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <span className="text-foreground font-medium">{option.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.privacy[option.key as keyof typeof preferences.privacy] as boolean}
                onChange={(e) => updatePreference(`privacy.${option.key}`, e.target.checked)}
                className="text-primary focus:ring-primary mt-1 ml-4"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesInteractive;