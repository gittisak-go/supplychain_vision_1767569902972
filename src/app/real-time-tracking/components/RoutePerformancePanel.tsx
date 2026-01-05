'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface RouteMetric {
  id: string;
  name: string;
  activeShipments: number;
  avgDelay: number;
  onTimeRate: number;
  criticalIssues: number;
  status: 'optimal' | 'warning' | 'critical';
}

const RoutePerformancePanel = () => {
  const mockRoutes: RouteMetric[] = [
    {
      id: 'RT-001',
      name: 'West Coast Express',
      activeShipments: 24,
      avgDelay: 2.5,
      onTimeRate: 87,
      criticalIssues: 1,
      status: 'warning'
    },
    {
      id: 'RT-002',
      name: 'East Coast Corridor',
      activeShipments: 18,
      avgDelay: 0.8,
      onTimeRate: 94,
      criticalIssues: 0,
      status: 'optimal'
    },
    {
      id: 'RT-003',
      name: 'Central Hub Network',
      activeShipments: 31,
      avgDelay: 4.2,
      onTimeRate: 76,
      criticalIssues: 3,
      status: 'critical'
    },
    {
      id: 'RT-004',
      name: 'Southern Gateway',
      activeShipments: 15,
      avgDelay: 1.5,
      onTimeRate: 91,
      criticalIssues: 0,
      status: 'optimal'
    }
  ];

  const getStatusColor = (status: RouteMetric['status']) => {
    switch (status) {
      case 'optimal': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: RouteMetric['status']) => {
    switch (status) {
      case 'optimal': return 'CheckCircleIcon';
      case 'warning': return 'ExclamationTriangleIcon';
      case 'critical': return 'XCircleIcon';
      default: return 'QuestionMarkCircleIcon';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Route Performance</h2>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth">
          <Icon name="ArrowPathIcon" size={16} />
        </button>
      </div>

      {/* Route Metrics */}
      <div className="space-y-4">
        {mockRoutes.map((route) => (
          <div key={route.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-foreground">{route.name}</h3>
                <p className="text-xs text-muted-foreground">{route.id}</p>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(route.status)}`}>
                <Icon name={getStatusIcon(route.status) as any} size={16} />
                <span className="text-xs font-medium capitalize">{route.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Active Shipments</div>
                <div className="text-lg font-semibold text-foreground">{route.activeShipments}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Delay</div>
                <div className="text-lg font-semibold text-foreground">{route.avgDelay}h</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">On-Time Rate</span>
                <span className="text-foreground font-medium">{route.onTimeRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    route.onTimeRate >= 90 ? 'bg-success' : 
                    route.onTimeRate >= 80 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${route.onTimeRate}%` }}
                ></div>
              </div>
            </div>

            {route.criticalIssues > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-destructive/10 rounded-lg">
                <Icon name="ExclamationTriangleIcon" size={14} className="text-destructive" />
                <span className="text-xs text-destructive font-medium">
                  {route.criticalIssues} critical issue{route.criticalIssues > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="LightBulbIcon" size={16} className="text-warning" />
          <span>Optimization Recommendations</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-sm font-medium text-foreground">Reroute Central Hub Traffic</div>
              <div className="text-xs text-muted-foreground mt-1">
                Consider alternative routes to reduce 4.2h average delay
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-warning/5 rounded-lg">
            <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-sm font-medium text-foreground">Weather Impact Alert</div>
              <div className="text-xs text-muted-foreground mt-1">
                Storm system affecting West Coast routes through Thursday
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-success/5 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-sm font-medium text-foreground">Capacity Optimization</div>
              <div className="text-xs text-muted-foreground mt-1">
                East Coast Corridor has 15% available capacity for urgent shipments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <button className="flex items-center justify-between p-3 text-left hover:bg-muted rounded-lg transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="MapIcon" size={16} className="text-primary" />
              <span className="text-sm text-foreground">View Route Map</span>
            </div>
            <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
          </button>
          
          <button className="flex items-center justify-between p-3 text-left hover:bg-muted rounded-lg transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="ClockIcon" size={16} className="text-warning" />
              <span className="text-sm text-foreground">Schedule Analysis</span>
            </div>
            <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
          </button>
          
          <button className="flex items-center justify-between p-3 text-left hover:bg-muted rounded-lg transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="ExclamationTriangleIcon" size={16} className="text-destructive" />
              <span className="text-sm text-foreground">Critical Issues</span>
            </div>
            <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutePerformancePanel;