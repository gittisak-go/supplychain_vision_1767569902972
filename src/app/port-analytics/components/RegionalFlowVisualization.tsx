'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FlowData {
  id: string;
  origin: string;
  destination: string;
  volume: number;
  status: 'normal' | 'congested' | 'critical';
  estimatedTime: string;
  bottleneck?: string;
}

interface RegionalFlowVisualizationProps {
  flowData: FlowData[];
}

const RegionalFlowVisualization = ({ flowData }: RegionalFlowVisualizationProps) => {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'congested':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'congested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getVolumeWidth = (volume: number) => {
    const maxVolume = Math.max(...flowData.map(f => f.volume));
    return Math.max((volume / maxVolume) * 100, 10);
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Regional Shipment Flow</h3>
          <p className="text-sm text-muted-foreground">Port-to-port volume distribution and bottleneck analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Congested</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="space-y-4 mb-6">
        {flowData.map((flow) => (
          <div
            key={flow.id}
            className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
              selectedFlow === flow.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
            onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Icon name="TruckIcon" size={20} className="text-muted-foreground" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{flow.origin}</span>
                    <Icon name="ArrowRightIcon" size={16} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{flow.destination}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">ETA: {flow.estimatedTime}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-foreground">{flow.volume.toLocaleString()}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeColor(flow.status)}`}>
                  {flow.status}
                </span>
              </div>
            </div>

            {/* Volume Bar */}
            <div className="relative">
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(flow.status)}`}
                  style={{ width: `${getVolumeWidth(flow.volume)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Volume</span>
                <span className="text-xs font-medium text-foreground">{flow.volume.toLocaleString()} TEU</span>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedFlow === flow.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Route Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Distance:</span>
                        <span className="text-sm font-medium text-foreground">2,450 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Transit Time:</span>
                        <span className="text-sm font-medium text-foreground">72 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vessels:</span>
                        <span className="text-sm font-medium text-foreground">12 active</span>
                      </div>
                    </div>
                  </div>
                  {flow.bottleneck && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Bottleneck Analysis</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon name="ExclamationTriangleIcon" size={16} className="text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Identified Issue</span>
                        </div>
                        <p className="text-sm text-yellow-700">{flow.bottleneck}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {flowData.reduce((sum, flow) => sum + flow.volume, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Volume (TEU)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{flowData.length}</p>
          <p className="text-sm text-muted-foreground">Active Routes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">
            {flowData.filter(f => f.status === 'critical').length}
          </p>
          <p className="text-sm text-muted-foreground">Critical Issues</p>
        </div>
      </div>
    </div>
  );
};

export default RegionalFlowVisualization;