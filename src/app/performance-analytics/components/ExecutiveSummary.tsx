import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface InsightItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  impact: string;
  action?: string;
}

interface ExecutiveSummaryProps {
  insights: InsightItem[];
}

const ExecutiveSummary = ({ insights }: ExecutiveSummaryProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'CheckCircleIcon';
      case 'warning':
        return 'ExclamationTriangleIcon';
      case 'error':
        return 'XCircleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success bg-success/10 border-success/20';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'error':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="LightBulbIcon" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <Icon 
                name={getInsightIcon(insight.type) as any} 
                size={16} 
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-90 mb-2">{insight.description}</p>
                <div className="text-xs font-medium">Impact: {insight.impact}</div>
                {insight.action && (
                  <div className="text-xs mt-2 font-medium">Action: {insight.action}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSummary;