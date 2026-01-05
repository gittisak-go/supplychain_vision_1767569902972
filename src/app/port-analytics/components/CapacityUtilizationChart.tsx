'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface UtilizationData {
  hour: string;
  terminal_a: number;
  terminal_b: number;
  terminal_c: number;
  terminal_d: number;
  total_capacity: number;
}

interface CapacityUtilizationChartProps {
  data: UtilizationData[];
}

const CapacityUtilizationChart = ({ data }: CapacityUtilizationChartProps) => {
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);

  const terminals = [
    { key: 'terminal_a', name: 'Terminal A', color: '#6B5BFF' },
    { key: 'terminal_b', name: 'Terminal B', color: '#FF6B9D' },
    { key: 'terminal_c', name: 'Terminal C', color: '#FFD93D' },
    { key: 'terminal_d', name: 'Terminal D', color: '#10B981' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-modal">
          <p className="font-medium text-foreground mb-2">{`Hour: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-medium text-foreground">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleTerminalFilter = (terminalKey: string) => {
    setSelectedTerminal(selectedTerminal === terminalKey ? null : terminalKey);
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Hourly Capacity Utilization</h3>
          <p className="text-sm text-muted-foreground">Real-time terminal capacity across port areas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="ChartBarIcon" size={20} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Last 24 Hours</span>
        </div>
      </div>

      {/* Terminal Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {terminals.map((terminal) => (
          <button
            key={terminal.key}
            onClick={() => handleTerminalFilter(terminal.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
              selectedTerminal === terminal.key
                ? 'bg-primary text-primary-foreground'
                : selectedTerminal === null
                ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                : 'bg-muted/50 text-muted-foreground/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: terminal.color }}
              />
              <span>{terminal.name}</span>
            </div>
          </button>
        ))}
        {selectedTerminal && (
          <button
            onClick={() => setSelectedTerminal(null)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-smooth"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="hour" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {terminals.map((terminal) => (
              <Bar
                key={terminal.key}
                dataKey={terminal.key}
                name={terminal.name}
                fill={terminal.color}
                radius={[2, 2, 0, 0]}
                opacity={selectedTerminal === null || selectedTerminal === terminal.key ? 1 : 0.3}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        {terminals.map((terminal) => {
          const avgUtilization = data.reduce((sum, item) => sum + (item as any)[terminal.key], 0) / data.length;
          return (
            <div key={terminal.key} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: terminal.color }}
                />
                <span className="text-sm font-medium text-foreground">{terminal.name}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{avgUtilization.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg. Utilization</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CapacityUtilizationChart;