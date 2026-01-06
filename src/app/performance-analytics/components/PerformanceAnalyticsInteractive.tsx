'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import KPIMetricsStrip from './KPIMetricsStrip';
import FilterControls from './FilterControls';
import DeliveryPerformanceChart from './DeliveryPerformanceChart';
import ExecutiveSummary from './ExecutiveSummary';
import HistoricalTrendAnalysis from './HistoricalTrendAnalysis';

interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparklineData: number[];
  color: string;
  icon: string;
}

interface ChartDataPoint {
  month: string;
  onTimeDelivery: number;
  averageDelay: number;
  costPerShipment: number;
  vendorScore: number;
  predictedDelivery: number;
}

interface TrendDataPoint {
  period: string;
  deliveryRate: number;
  cost: number;
  volume: number;
  seasonalIndex: number;
  anomaly?: boolean;
  anomalyType?: 'delay' | 'cost' | 'volume';
}

const mockKPIMetrics: KPIMetric[] = [
  {
    id: '1',
    title: 'On-Time Delivery Rate',
    value: '94.2%',
    change: 2.3,
    trend: 'up',
    sparklineData: [91, 92, 93, 91, 94, 95, 94],
    color: 'from-green-500 to-green-600',
    icon: 'TruckIcon'
  },
  {
    id: '2',
    title: 'Cost Per Shipment',
    value: '$127.50',
    change: -1.8,
    trend: 'down',
    sparklineData: [135, 132, 130, 129, 128, 127, 128],
    color: 'from-blue-500 to-blue-600',
    icon: 'CurrencyDollarIcon'
  },
  {
    id: '3',
    title: 'Vendor Performance Score',
    value: '87.6',
    change: 4.1,
    trend: 'up',
    sparklineData: [82, 84, 85, 86, 87, 88, 88],
    color: 'from-pink-500 to-pink-600',
    icon: 'UserGroupIcon'
  },
  {
    id: '4',
    title: 'Predictive Accuracy',
    value: '91.8%',
    change: 1.2,
    trend: 'up',
    sparklineData: [89, 90, 91, 90, 92, 92, 92],
    color: 'from-yellow-500 to-yellow-600',
    icon: 'ChartBarIcon'
  }
];

const mockChartData: ChartDataPoint[] = [
  { month: 'Jan 2024', onTimeDelivery: 92.1, averageDelay: 4.2, costPerShipment: 135, vendorScore: 85, predictedDelivery: 90.5 },
  { month: 'Feb 2024', onTimeDelivery: 91.8, averageDelay: 4.5, costPerShipment: 132, vendorScore: 84, predictedDelivery: 89.8 },
  { month: 'Mar 2024', onTimeDelivery: 93.2, averageDelay: 3.8, costPerShipment: 130, vendorScore: 86, predictedDelivery: 91.2 },
  { month: 'Apr 2024', onTimeDelivery: 92.5, averageDelay: 4.1, costPerShipment: 129, vendorScore: 85, predictedDelivery: 90.8 },
  { month: 'May 2024', onTimeDelivery: 94.1, averageDelay: 3.5, costPerShipment: 128, vendorScore: 87, predictedDelivery: 92.1 },
  { month: 'Jun 2024', onTimeDelivery: 93.8, averageDelay: 3.7, costPerShipment: 127, vendorScore: 88, predictedDelivery: 91.8 },
  { month: 'Jul 2024', onTimeDelivery: 94.5, averageDelay: 3.2, costPerShipment: 128, vendorScore: 87, predictedDelivery: 92.5 },
  { month: 'Aug 2024', onTimeDelivery: 93.9, averageDelay: 3.6, costPerShipment: 126, vendorScore: 89, predictedDelivery: 91.9 },
  { month: 'Sep 2024', onTimeDelivery: 95.2, averageDelay: 2.9, costPerShipment: 125, vendorScore: 88, predictedDelivery: 93.2 },
  { month: 'Oct 2024', onTimeDelivery: 94.8, averageDelay: 3.1, costPerShipment: 127, vendorScore: 89, predictedDelivery: 92.8 },
  { month: 'Nov 2024', onTimeDelivery: 94.2, averageDelay: 3.4, costPerShipment: 128, vendorScore: 88, predictedDelivery: 92.2 }
];

const mockHistoricalData: TrendDataPoint[] = [
  { period: 'Q1 2023', deliveryRate: 89.2, cost: 140, volume: 1250, seasonalIndex: 0.95 },
  { period: 'Q2 2023', deliveryRate: 91.1, cost: 138, volume: 1380, seasonalIndex: 1.05 },
  { period: 'Q3 2023', deliveryRate: 88.5, cost: 142, volume: 1420, seasonalIndex: 1.10, anomaly: true, anomalyType: 'delay' },
  { period: 'Q4 2023', deliveryRate: 90.8, cost: 139, volume: 1680, seasonalIndex: 1.15 },
  { period: 'Q1 2024', deliveryRate: 92.4, cost: 135, volume: 1320, seasonalIndex: 0.98 },
  { period: 'Q2 2024', deliveryRate: 93.1, cost: 132, volume: 1450, seasonalIndex: 1.08 },
  { period: 'Q3 2024', deliveryRate: 94.5, cost: 128, volume: 1520, seasonalIndex: 1.12 },
  { period: 'Q4 2024', deliveryRate: 94.2, cost: 127, volume: 1750, seasonalIndex: 1.18 }
];

const mockInsights = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Delivery Performance Improvement',
    description: 'On-time delivery rate increased by 2.3% compared to last period',
    impact: 'Customer satisfaction up 5%, reduced complaints by 18%',
    action: 'Continue current optimization strategies'
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Seasonal Volume Spike Expected',
    description: 'Historical data indicates 15% volume increase in next quarter',
    impact: 'Potential capacity constraints, delivery delays possible',
    action: 'Scale resources, negotiate additional carrier capacity'
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'Cost Optimization Success',
    description: 'Cost per shipment reduced by $7.50 through route optimization',
    impact: 'Annual savings projection: $2.1M',
    action: 'Expand optimization to additional routes'
  }
];

const mockBottlenecks = [
  {
    id: '1',
    location: 'Los Angeles Port',
    severity: 'high' as const,
    impact: 'Causing 2-3 day delays for West Coast shipments',
    affectedShipments: 145,
    estimatedDelay: '2.5 days'
  },
  {
    id: '2',
    location: 'Chicago Distribution Hub',
    severity: 'medium' as const,
    impact: 'Processing delays during peak hours',
    affectedShipments: 89,
    estimatedDelay: '8 hours'
  },
  {
    id: '3',
    location: 'I-95 Corridor',
    severity: 'low' as const,
    impact: 'Weather-related slowdowns',
    affectedShipments: 34,
    estimatedDelay: '4 hours'
  }
];

const mockRecommendations = [
  {
    id: '1',
    category: 'Route Optimization',
    title: 'Implement Dynamic Routing',
    description: 'Deploy AI-powered dynamic routing to avoid congestion and optimize delivery times',
    potentialSavings: '$850K annually',
    implementation: '3-4 months',
    priority: 'high' as const
  },
  {
    id: '2',
    category: 'Vendor Management',
    title: 'Diversify Carrier Portfolio',
    description: 'Add 2-3 regional carriers to reduce dependency on primary carriers',
    potentialSavings: '$420K annually',
    implementation: '6-8 weeks',
    priority: 'medium' as const
  },
  {
    id: '3',
    category: 'Predictive Analytics',
    title: 'Enhanced Demand Forecasting',
    description: 'Implement machine learning models for better demand prediction',
    potentialSavings: '$1.2M annually',
    implementation: '4-6 months',
    priority: 'high' as const
  }
];

const PerformanceAnalyticsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedDateMode, setSelectedDateMode] = useState('period-over-period');
  const [selectedMetric, setSelectedMetric] = useState('delivery-performance');
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  
  // Add new state for custom date range
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [filteredChartData, setFilteredChartData] = useState(mockChartData);
  const [filteredHistoricalData, setFilteredHistoricalData] = useState(mockHistoricalData);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Filter data based on custom date range
  useEffect(() => {
    if (customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);

      const filtered = mockChartData.filter(item => {
        const itemDate = new Date(item.month);
        return itemDate >= startDate && itemDate <= endDate;
      });

      setFilteredChartData(filtered.length > 0 ? filtered : mockChartData);
    } else {
      setFilteredChartData(mockChartData);
    }
  }, [customDateRange]);

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setCustomDateRange(range);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = filteredChartData;

    if (format === 'csv') {
      const headers = ['Month', 'On-Time Delivery', 'Avg Delay', 'Cost/Shipment', 'Vendor Score', 'Predicted Delivery'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(item => [
          item.month,
          item.onTimeDelivery,
          item.averageDelay,
          item.costPerShipment,
          item.vendorScore,
          item.predictedDelivery
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Excel export with insights and recommendations
      const headers = ['Performance Analytics Report', '', '', '', '', ''];
      const dateInfo = [`Report Generated: ${new Date().toLocaleDateString()}`, '', '', '', '', ''];
      const emptyRow = ['', '', '', '', '', ''];
      
      const metricsHeaders = ['Month', 'On-Time Delivery', 'Avg Delay', 'Cost/Shipment', 'Vendor Score', 'Predicted'];
      const metricsData = dataToExport.map(item => [
        item.month,
        `${item.onTimeDelivery}%`,
        `${item.averageDelay} hours`,
        `$${item.costPerShipment}`,
        item.vendorScore,
        `${item.predictedDelivery}%`
      ]);

      const insightsHeader = ['Key Insights', '', '', '', '', ''];
      const insightsData = mockInsights.map(insight => [
        insight.title,
        insight.description,
        insight.impact,
        insight.action,
        '',
        ''
      ]);

      const csvContent = [
        headers,
        dateInfo,
        emptyRow,
        metricsHeaders,
        ...metricsData,
        emptyRow,
        insightsHeader,
        ...insightsData
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-analytics-detailed-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      alert('PDF export will be available soon. For now, please use CSV or Excel export.');
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterControls
        onDateModeChange={setSelectedDateMode}
        onMetricChange={setSelectedMetric}
        onAlertConfigOpen={() => setShowAlertConfig(true)}
        onDateRangeChange={handleDateRangeChange}
        onExport={handleExport}
      />
      
      <KPIMetricsStrip metrics={mockKPIMetrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <DeliveryPerformanceChart 
            data={filteredChartData}
            selectedMetric={selectedMetric}
          />
        </div>
        
        <div>
          <ExecutiveSummary insights={mockInsights} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-card">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Bottlenecks</h3>
          </div>
          
          <div className="space-y-3">
            {mockBottlenecks.map((bottleneck) => (
              <div key={bottleneck.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-foreground">{bottleneck.location}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    bottleneck.severity === 'high' ? 'bg-error text-error-foreground' :
                    bottleneck.severity === 'medium' ? 'bg-warning text-warning-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {bottleneck.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Affected:</span> {bottleneck.affectedShipments} shipments
                  </div>
                  <div>
                    <span className="font-medium">Delay:</span> {bottleneck.estimatedDelay}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">{bottleneck.impact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-card">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="CogIcon" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {mockRecommendations.map((rec) => (
              <div key={rec.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {rec.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      rec.priority === 'high' ? 'bg-error/10 text-error border-error/20' :
                      rec.priority === 'medium'? 'bg-warning/10 text-warning border-warning/20' : 'bg-muted/50 text-muted-foreground border-border'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-medium text-sm text-foreground mb-2">{rec.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-success/10 text-success p-2 rounded">
                    <span className="font-medium">Potential Savings:</span> {rec.potentialSavings}
                  </div>
                  <div className="bg-muted/50 text-muted-foreground p-2 rounded">
                    <span className="font-medium">Implementation:</span> {rec.implementation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <HistoricalTrendAnalysis data={filteredHistoricalData} />
      
      {showAlertConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Alert Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure custom alerts for performance thresholds and anomaly detection.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAlertConfig(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAlertConfig(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalyticsInteractive;