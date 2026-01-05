'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  items: number;
  eta: string;
  status: 'in-transit' | 'delayed' | 'delivered' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  carrier: string;
  progress: number;
  lastUpdate: string;
}

interface ShipmentsTableProps {
  searchTerm: string;
  filters: {
    status: string;
    priority: string;
    dateRange: string;
  };
}

const ShipmentsTable = ({ searchTerm, filters }: ShipmentsTableProps) => {
  const [sortField, setSortField] = useState<keyof Shipment>('eta');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);

  const mockShipments: Shipment[] = [
    {
      id: 'SH-2024-001',
      origin: 'Los Angeles, CA',
      destination: 'New York, NY',
      items: 245,
      eta: '2024-11-20 14:30',
      status: 'in-transit',
      priority: 'high',
      carrier: 'FedEx Ground',
      progress: 75,
      lastUpdate: '2024-11-19 04:45'
    },
    {
      id: 'SH-2024-002',
      origin: 'Seattle, WA',
      destination: 'Miami, FL',
      items: 156,
      eta: '2024-11-21 09:15',
      status: 'delayed',
      priority: 'critical',
      carrier: 'UPS Express',
      progress: 45,
      lastUpdate: '2024-11-19 04:30'
    },
    {
      id: 'SH-2024-003',
      origin: 'Chicago, IL',
      destination: 'Denver, CO',
      items: 89,
      eta: '2024-11-19 16:00',
      status: 'delivered',
      priority: 'medium',
      carrier: 'DHL Express',
      progress: 100,
      lastUpdate: '2024-11-19 15:45'
    },
    {
      id: 'SH-2024-004',
      origin: 'Houston, TX',
      destination: 'Phoenix, AZ',
      items: 312,
      eta: '2024-11-22 11:45',
      status: 'pending',
      priority: 'low',
      carrier: 'USPS Priority',
      progress: 15,
      lastUpdate: '2024-11-19 04:00'
    },
    {
      id: 'SH-2024-005',
      origin: 'Boston, MA',
      destination: 'Atlanta, GA',
      items: 198,
      eta: '2024-11-20 18:20',
      status: 'in-transit',
      priority: 'high',
      carrier: 'FedEx Express',
      progress: 60,
      lastUpdate: '2024-11-19 04:40'
    }
  ];

  const getStatusBadge = (status: Shipment['status']) => {
    const statusConfig = {
      'in-transit': { color: 'bg-blue-100 text-blue-800', label: 'In Transit' },
      'delayed': { color: 'bg-red-100 text-red-800', label: 'Delayed' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Shipment['priority']) => {
    const priorityConfig = {
      'critical': { color: 'bg-red-500', label: 'Critical' },
      'high': { color: 'bg-orange-500', label: 'High' },
      'medium': { color: 'bg-yellow-500', label: 'Medium' },
      'low': { color: 'bg-gray-500', label: 'Low' }
    };

    const config = priorityConfig[priority];
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>
    );
  };

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = mockShipments.filter(shipment => {
      const matchesSearch = searchTerm === '' || 
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || shipment.status === filters.status;
      const matchesPriority = filters.priority === 'all' || shipment.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipments(prev => 
      prev.includes(shipmentId) 
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedShipments.length === filteredAndSortedShipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(filteredAndSortedShipments.map(s => s.id));
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Table Header Actions */}
      {selectedShipments.length > 0 && (
        <div className="px-6 py-3 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedShipments.length} shipment(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-smooth">
                Update Status
              </button>
              <button className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-smooth">
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedShipments.length === filteredAndSortedShipments.length && filteredAndSortedShipments.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border focus:ring-ring"
                />
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipment ID</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('origin')}
              >
                <div className="flex items-center space-x-1">
                  <span>Origin</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('destination')}
              >
                <div className="flex items-center space-x-1">
                  <span>Destination</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('items')}
              >
                <div className="flex items-center space-x-1">
                  <span>Items</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('eta')}
              >
                <div className="flex items-center space-x-1">
                  <span>ETA</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSortedShipments.map((shipment) => (
              <tr 
                key={shipment.id} 
                className={`hover:bg-muted/50 transition-smooth ${
                  selectedShipments.includes(shipment.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedShipments.includes(shipment.id)}
                    onChange={() => handleSelectShipment(shipment.id)}
                    className="rounded border-border focus:ring-ring"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">{shipment.id}</div>
                  <div className="text-xs text-muted-foreground">{shipment.carrier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{shipment.origin}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{shipment.destination}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{shipment.items.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    {new Date(shipment.eta).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(shipment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(shipment.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{shipment.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      title="View details"
                    >
                      <Icon name="EyeIcon" size={16} />
                    </button>
                    <button 
                      className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      title="Track shipment"
                    >
                      <Icon name="MapPinIcon" size={16} />
                    </button>
                    <button 
                      className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      title="More options"
                    >
                      <Icon name="EllipsisVerticalIcon" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedShipments.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Icon name="TruckIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No shipments found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find shipments.
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredAndSortedShipments.length > 0 && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedShipments.length} of {mockShipments.length} shipments
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-smooth">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-smooth">
                1
              </button>
              <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-smooth">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTable;