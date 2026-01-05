'use client';

import React, { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface TrendDataPoint {
  period: string;
  deliveryRate: number;
  cost: number;
  volume: number;
  seasonalIndex: number;
  anomaly?: boolean;
  anomalyType?: 'delay' | 'cost' | 'volume';
}

interface HistoricalTrendAnalysisProps {
  data: TrendDataPoint[];
}

const HistoricalTrendAnalysis = ({ data }: HistoricalTrendAnalysisProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24-months');
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showSeasonalPattern, setShowSeasonalPattern] = useState(false);

  const timeframeOptions = [
    { value: '12-months', label: '12 Months' },
    { value: '24-months', label: '24 Months' },
    { value: '36-months', label: '3 Years' },
    { value: 'all-time', label: 'All Time' }
  ];

  const getFilteredData = () => {
    switch (selectedTimeframe) {
      case '12-months':
        return data.slice(-12);
      case '24-months':
        return data.slice(-24);
      case '36-months':
        return data.slice(-36);
      default:
        return data;
    }
  };

  const filteredData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-modal max-w-xs">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'deliveryRate' ? '%' : 
               entry.dataKey === 'cost' ? '$' : 
               entry.dataKey === 'volume' ? ' shipments' : ''}
            </p>
          ))}
          {dataPoint?.anomaly && (
            <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-xs">
              <div className="flex items-center space-x-1 text-error">
                <Icon name="ExclamationTriangleIcon" size={12} />
                <span className="font-medium">Anomaly Detected</span>
              </div>
              <p className="text-error/80 mt-1">
                {dataPoint.anomalyType === 'delay' && 'Unusual delivery delays'}
                {dataPoint.anomalyType === 'cost' && 'Cost spike detected'}
                {dataPoint.anomalyType === 'volume' && 'Volume anomaly'}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload?.anomaly && showAnomalies) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#EF4444"
          stroke="#FFFFFF"
          strokeWidth={2}
          className="animate-pulse"
        />
      );
    }
    return null;
  };

  const averageDeliveryRate = filteredData.reduce((sum, item) => sum + item.deliveryRate, 0) / filteredData.length;

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Historical Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">2+ year data retention with seasonal pattern recognition</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {timeframeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAnomalies(!showAnomalies)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-smooth ${
                showAnomalies 
                  ? 'bg-error/10 text-error border border-error/20' :'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="ExclamationTriangleIcon" size={14} />
              <span>Anomalies</span>
            </button>
            
            <button
              onClick={() => setShowSeasonalPattern(!showSeasonalPattern)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-smooth ${
                showSeasonalPattern 
                  ? 'bg-primary/10 text-primary border border-primary/20' :'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="CalendarIcon" size={14} />
              <span>Seasonal</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="period" 
              stroke="#6B7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar 
              yAxisId="right"
              dataKey="volume" 
              fill="#6B5BFF" 
              fillOpacity={0.3}
              name="Shipment Volume"
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="deliveryRate"
              stroke="#10B981"
              strokeWidth={3}
              name="Delivery Rate (%)"
              dot={<CustomDot />}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cost"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Cost Index"
            />
            
            {showSeasonalPattern && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="seasonalIndex"
                stroke="#FFD93D"
                strokeWidth={2}
                strokeDasharray="2 2"
                name="Seasonal Index"
              />
            )}
            
            <ReferenceLine 
              yAxisId="left"
              y={averageDeliveryRate} 
              stroke="#6B7280" 
              strokeDasharray="3 3"
              label={{ value: `Avg: ${averageDeliveryRate.toFixed(1)}%`, position: "topRight" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{filteredData.filter(d => d.anomaly).length}</div>
          <div className="text-sm text-muted-foreground">Anomalies Detected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{averageDeliveryRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Average Delivery Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">
            {Math.max(...filteredData.map(d => d.seasonalIndex)).toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Peak Seasonal Index</div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendAnalysis;