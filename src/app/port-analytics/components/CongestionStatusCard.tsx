import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface CongestionAlert {
  id: string;
  terminal: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  estimatedDelay: string;
  timestamp: string;
}

interface CongestionStatusCardProps {
  alerts: CongestionAlert[];
}

const CongestionStatusCard = ({ alerts }: CongestionStatusCardProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'ExclamationTriangleIcon';
      case 'high':
        return 'ExclamationCircleIcon';
      case 'medium':
        return 'InformationCircleIcon';
      default:
        return 'CheckCircleIcon';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Congestion Alerts</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} transition-smooth hover:shadow-md`}
          >
            <div className="flex items-start space-x-3">
              <Icon 
                name={getSeverityIcon(alert.severity) as any} 
                size={20} 
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{alert.terminal}</h4>
                  <span className="text-xs opacity-75">{alert.estimatedDelay}</span>
                </div>
                <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-75">{alert.timestamp}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircleIcon" size={48} className="text-success mx-auto mb-3" />
          <p className="text-muted-foreground">No congestion alerts</p>
          <p className="text-sm text-muted-foreground">All terminals operating normally</p>
        </div>
      )}
    </div>
  );
};

export default CongestionStatusCard;