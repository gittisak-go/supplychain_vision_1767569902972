'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ActivityEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  resource: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
  userAgent: string;
  details: {
    module: string;
    changes?: string[];
    context?: string;
  };
}

interface FilterState {
  dateRange: 'last24h' | 'lastWeek' | 'lastMonth' | 'custom';
  activityType: 'all' | 'logins' | 'dataAccess' | 'configChanges' | 'reports';
  severity: 'all' | 'info' | 'warning' | 'critical';
  searchQuery: string;
}

const ActivityLogInteractive = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last24h',
    activityType: 'all',
    severity: 'all',
    searchQuery: ''
  });
  
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock activity data
  const activityData: ActivityEntry[] = useMemo(() => [
    {
      id: '1',
      timestamp: new Date('2025-11-19T05:15:00'),
      action: 'Login',
      description: 'Successful authentication',
      resource: 'Authentication System',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        module: 'Authentication',
        context: 'Standard login procedure'
      }
    },
    {
      id: '2',
      timestamp: new Date('2025-11-19T04:45:00'),
      action: 'Data Access',
      description: 'Accessed shipment tracking data',
      resource: 'Real-Time Tracking Module',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        module: 'Tracking',
        context: 'Viewed shipment details for SH-2025-001234'
      }
    },
    {
      id: '3',
      timestamp: new Date('2025-11-19T04:30:00'),
      action: 'Configuration Change',
      description: 'Updated alert thresholds',
      resource: 'Alert Management',
      severity: 'warning',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        module: 'Alerts',
        changes: [
          'Port congestion threshold: 85% → 80%',
          'Delay alert trigger: 24h → 12h'
        ],
        context: 'Proactive monitoring improvement'
      }
    },
    {
      id: '4',
      timestamp: new Date('2025-11-19T03:20:00'),
      action: 'Report Generated',
      description: 'Export performance analytics report',
      resource: 'Performance Analytics',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        module: 'Analytics',
        context: 'Monthly performance report - November 2025'
      }
    },
    {
      id: '5',
      timestamp: new Date('2025-11-19T02:15:00'),
      action: 'Suspicious Activity',
      description: 'Multiple failed login attempts detected',
      resource: 'Security System',
      severity: 'critical',
      ipAddress: '203.0.113.15',
      userAgent: 'Unknown/Automated',
      details: {
        module: 'Security',
        context: 'Blocked IP after 5 failed attempts'
      }
    }
  ], []);

  const filteredActivities = useMemo(() => {
    return activityData.filter(activity => {
      // Date range filter
      const now = new Date();
      const activityDate = activity.timestamp;
      let dateMatch = true;
      
      switch (filters.dateRange) {
        case 'last24h':
          dateMatch = (now.getTime() - activityDate.getTime()) <= 24 * 60 * 60 * 1000;
          break;
        case 'lastWeek':
          dateMatch = (now.getTime() - activityDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'lastMonth':
          dateMatch = (now.getTime() - activityDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          break;
      }

      // Activity type filter
      const typeMatch = filters.activityType === 'all' || 
        (filters.activityType === 'logins' && activity.action === 'Login') ||
        (filters.activityType === 'dataAccess' && activity.action === 'Data Access') ||
        (filters.activityType === 'configChanges' && activity.action === 'Configuration Change') ||
        (filters.activityType === 'reports' && activity.action === 'Report Generated');

      // Severity filter
      const severityMatch = filters.severity === 'all' || activity.severity === filters.severity;

      // Search filter
      const searchMatch = filters.searchQuery === '' || 
        activity.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        activity.resource.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return dateMatch && typeMatch && severityMatch && searchMatch;
    });
  }, [activityData, filters]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'ExclamationTriangleIcon';
      case 'warning': return 'ExclamationCircleIcon';
      default: return 'InformationCircleIcon';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="last24h">Last 24 Hours</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Activity Type */}
          <select
            value={filters.activityType}
            onChange={(e) => setFilters(prev => ({ ...prev, activityType: e.target.value as FilterState['activityType'] }))}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Activities</option>
            <option value="logins">Logins</option>
            <option value="dataAccess">Data Access</option>
            <option value="configChanges">Configuration Changes</option>
            <option value="reports">Reports Generated</option>
          </select>

          {/* Severity */}
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as FilterState['severity'] }))}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Export Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedActivities.length} of {filteredActivities.length} activities
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Icon name="DocumentArrowDownIcon" size={16} />
            Export Activities
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {paginatedActivities.map((activity) => (
          <div key={activity.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Severity Indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getSeverityColor(activity.severity)}`}>
                  <Icon name={getSeverityIcon(activity.severity) as any} size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-foreground">{activity.action}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {activity.details.module}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-2">{activity.description}</p>

                  {/* Resource & IP */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Resource: {activity.resource}</span>
                    <span>IP: {activity.ipAddress}</span>
                  </div>

                  {/* Expandable Details */}
                  {expandedActivity === activity.id && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">User Agent:</span>
                          <div className="text-muted-foreground mt-1">{activity.userAgent}</div>
                        </div>
                        {activity.details.changes && (
                          <div>
                            <span className="font-medium">Changes Made:</span>
                            <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                              {activity.details.changes.map((change, index) => (
                                <li key={index}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {activity.details.context && (
                          <div>
                            <span className="font-medium">Context:</span>
                            <div className="text-muted-foreground mt-1">{activity.details.context}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                className="ml-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Icon 
                  name={expandedActivity === activity.id ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
                  size={16} 
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-card border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            <Icon name="ChevronLeftIcon" size={16} />
          </button>
          
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-card border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            <Icon name="ChevronRightIcon" size={16} />
          </button>
        </div>
      )}

      {/* Data Retention Notice */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="InformationCircleIcon" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-400 font-medium mb-1">Data Retention Policy</p>
            <p className="text-blue-300">
              Activity logs are retained for 90 days. Critical security events are archived for 1 year. 
              Activities older than 90 days are automatically archived and require special access to view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogInteractive;