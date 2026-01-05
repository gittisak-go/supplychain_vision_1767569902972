'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  shipmentId?: string;
  location?: string;
}

interface LiveAlertsFeedProps {
  alerts: Alert[];
}

const LiveAlertsFeed = ({ alerts }: LiveAlertsFeedProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="BellIcon" size={20} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Live Alerts</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return 'ExclamationTriangleIcon';
      case 'warning': return 'ExclamationCircleIcon';
      case 'info': return 'InformationCircleIcon';
      default: return 'BellIcon';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="BellIcon" size={20} className="text-foreground" />
          <h3 className="font-semibold text-foreground">Live Alerts</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-success">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth"
          >
            <div className={`p-1.5 rounded-full ${getAlertColor(alert.type)}`}>
              <Icon name={getAlertIcon(alert.type) as any} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {alert.title}
                </h4>
                <span className="text-xs text-muted-foreground ml-2">
                  {alert.timestamp}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {alert.message}
              </p>
              
              {(alert.shipmentId || alert.location) && (
                <div className="flex items-center space-x-4 text-xs">
                  {alert.shipmentId && (
                    <span className="text-primary">#{alert.shipmentId}</span>
                  )}
                  {alert.location && (
                    <span className="text-muted-foreground">{alert.location}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
          View All Alerts
        </button>
      </div>
    </div>
  );
};

export default LiveAlertsFeed;