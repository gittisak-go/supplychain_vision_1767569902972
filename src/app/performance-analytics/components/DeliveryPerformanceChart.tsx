'use client';

import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface ChartDataPoint {
  month: string;
  onTimeDelivery: number;
  averageDelay: number;
  costPerShipment: number;
  vendorScore: number;
  predictedDelivery: number;
}

interface DeliveryPerformanceChartProps {
  data: ChartDataPoint[];
  selectedMetric: string;
}

const DeliveryPerformanceChart = ({ data, selectedMetric }: DeliveryPerformanceChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showCorrelation, setShowCorrelation] = useState(false);
  const [brushRange, setBrushRange] = useState<{ startIndex?: number; endIndex?: number }>({});

  const getMetricConfig = (metric: string) => {
    switch (metric) {
      case 'delivery-performance':
        return {
          primary: { key: 'onTimeDelivery', name: 'On-Time Delivery %', color: '#10B981' },
          secondary: { key: 'averageDelay', name: 'Avg Delay (hours)', color: '#EF4444' }
        };
      case 'cost-analysis':
        return {
          primary: { key: 'costPerShipment', name: 'Cost per Shipment ($)', color: '#6B5BFF' },
          secondary: { key: 'onTimeDelivery', name: 'On-Time Delivery %', color: '#10B981' }
        };
      case 'vendor-performance':
        return {
          primary: { key: 'vendorScore', name: 'Vendor Score', color: '#FF6B9D' },
          secondary: { key: 'onTimeDelivery', name: 'On-Time Delivery %', color: '#10B981' }
        };
      case 'predictive-analytics':
        return {
          primary: { key: 'predictedDelivery', name: 'Predicted Delivery %', color: '#FFD93D' },
          secondary: { key: 'onTimeDelivery', name: 'Actual Delivery %', color: '#10B981' }
        };
      default:
        return {
          primary: { key: 'onTimeDelivery', name: 'On-Time Delivery %', color: '#10B981' },
          secondary: { key: 'averageDelay', name: 'Avg Delay (hours)', color: '#EF4444' }
        };
    }
  };

  const metricConfig = getMetricConfig(selectedMetric);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-modal">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.dataKey === 'costPerShipment' ? '' : entry.dataKey === 'averageDelay' ? 'h' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
    const DataComponent = chartType === 'area' ? Area : Line;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="month" 
            stroke="#6B7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <DataComponent
            type="monotone"
            dataKey={metricConfig.primary.key}
            stroke={metricConfig.primary.color}
            fill={chartType === 'area' ? `${metricConfig.primary.color}20` : undefined}
            strokeWidth={3}
            name={metricConfig.primary.name}
            dot={{ fill: metricConfig.primary.color, strokeWidth: 2, r: 4 }}
          />
          
          {showCorrelation && (
            <DataComponent
              type="monotone"
              dataKey={metricConfig.secondary.key}
              stroke={metricConfig.secondary.color}
              fill={chartType === 'area' ? `${metricConfig.secondary.color}20` : undefined}
              strokeWidth={2}
              strokeDasharray="5 5"
              name={metricConfig.secondary.name}
              dot={{ fill: metricConfig.secondary.color, strokeWidth: 2, r: 3 }}
            />
          )}
          
          <Brush
            dataKey="month"
            height={30}
            stroke="#6B5BFF"
            startIndex={brushRange.startIndex}
            endIndex={brushRange.endIndex}
            onChange={(range) => setBrushRange(range)}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Performance Trends</h3>
          <p className="text-sm text-muted-foreground">Interactive analysis with drill-down capabilities</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-smooth ${
                chartType === 'line' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-sm font-medium transition-smooth ${
                chartType === 'area' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Area
            </button>
          </div>
          
          <button
            onClick={() => setShowCorrelation(!showCorrelation)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
              showCorrelation 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="LinkIcon" size={16} />
            <span>Correlation</span>
          </button>
        </div>
      </div>
      
      {renderChart()}
      
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Brush and zoom to focus on specific time periods</span>
          <span>•</span>
          <span>Click legend items to toggle visibility</span>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Icon name="InformationCircleIcon" size={14} />
          <span>Data refreshed every 15 minutes</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPerformanceChart;