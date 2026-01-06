import { supplyChainService } from './supplyChainService';
import { reservationService } from './reservationService';
import { vehicleService } from './vehicleService';

export interface AIContextData {
  fleetData: {
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    maintenanceVehicles: number;
    vehicles: any[];
  };
  reservationData: {
    totalReservations: number;
    activeReservations: number;
    upcomingReservations: number;
    recentReservations: any[];
  };
  supplyChainData: {
    totalShipments: number;
    activeShipments: number;
    delayedShipments: number;
    recentShipments: any[];
    portMetrics: any[];
  };
}

export const aiContextService = {
  /**
   * Fetches all relevant data from fleet, reservations, and supply chain
   * to provide context for AI assistant responses
   */
  async fetchFullContext(): Promise<AIContextData> {
    try {
      // Fetch fleet data
      const vehicleStats = await vehicleService.getVehicleStats();
      const allVehicles = await vehicleService.getAllVehicles();

      // Fetch reservation data
      const allReservations = await reservationService.getAllReservations();
      const activeReservations = await reservationService.getActiveReservations();
      const upcomingReservations = await reservationService.getUpcomingReservations();

      // Fetch supply chain data
      const { data: shipments } = await supplyChainService.getAllShipments();
      const activeShipments = shipments?.filter(s => s.shipmentStatus === 'in_transit') || [];
      const delayedShipments = shipments?.filter(s => {
        if (s.estimatedArrival) {
          const eta = new Date(s.estimatedArrival);
          const now = new Date();
          return eta < now && s.shipmentStatus !== 'delivered';
        }
        return false;
      }) || [];

      const { data: portMetrics } = await supplyChainService.getPortMetrics();

      return {
        fleetData: {
          totalVehicles: vehicleStats.total,
          availableVehicles: vehicleStats.available,
          rentedVehicles: vehicleStats.rented,
          maintenanceVehicles: vehicleStats.maintenance,
          vehicles: allVehicles.slice(0, 10) // Limit to 10 recent vehicles
        },
        reservationData: {
          totalReservations: allReservations.length,
          activeReservations: activeReservations.length,
          upcomingReservations: upcomingReservations.length,
          recentReservations: allReservations.slice(0, 10) // Limit to 10 recent reservations
        },
        supplyChainData: {
          totalShipments: shipments?.length || 0,
          activeShipments: activeShipments.length,
          delayedShipments: delayedShipments.length,
          recentShipments: shipments?.slice(0, 10) || [], // Limit to 10 recent shipments
          portMetrics: portMetrics?.slice(0, 5) || [] // Limit to 5 recent metrics
        }
      };
    } catch (error) {
      console.error('Error fetching AI context data:', error);
      // Return empty data structure if fetch fails
      return {
        fleetData: {
          totalVehicles: 0,
          availableVehicles: 0,
          rentedVehicles: 0,
          maintenanceVehicles: 0,
          vehicles: []
        },
        reservationData: {
          totalReservations: 0,
          activeReservations: 0,
          upcomingReservations: 0,
          recentReservations: []
        },
        supplyChainData: {
          totalShipments: 0,
          activeShipments: 0,
          delayedShipments: 0,
          recentShipments: [],
          portMetrics: []
        }
      };
    }
  },

  /**
   * Formats the context data into a readable string for AI processing
   */
  formatContextForAI(contextData: AIContextData): string {
    const fleet = `
## ข้อมูลฝูงยานพาหนะ (Fleet Data)
- ยานพาหนะทั้งหมด: ${contextData.fleetData.totalVehicles} คัน
- ยานพาหนะว่าง: ${contextData.fleetData.availableVehicles} คัน
- ยานพาหนะที่เช่าอยู่: ${contextData.fleetData.rentedVehicles} คัน
- ยานพาหนะในการบำรุงรักษา: ${contextData.fleetData.maintenanceVehicles} คัน
`;

    const reservations = `
## ข้อมูลการจอง (Reservations)
- การจองทั้งหมด: ${contextData.reservationData.totalReservations} รายการ
- การจองที่ใช้งานอยู่: ${contextData.reservationData.activeReservations} รายการ
- การจองที่จะมาถึง: ${contextData.reservationData.upcomingReservations} รายการ
`;

    const supplyChain = `
## ข้อมูลซัพพลายเชน (Supply Chain)
- การขนส่งทั้งหมด: ${contextData.supplyChainData.totalShipments} รายการ
- การขนส่งที่กำลังดำเนินการ: ${contextData.supplyChainData.activeShipments} รายการ
- การขนส่งที่ล่าช้า: ${contextData.supplyChainData.delayedShipments} รายการ
`;

    return `${fleet}\n${reservations}\n${supplyChain}`;
  },

  /**
   * Analyzes query to determine what specific data is needed
   */
  async getRelevantContext(query: string): Promise<string> {
    const contextData = await this.fetchFullContext();
    let relevantContext = '';

    // Check for fleet-related queries
    if (query.includes('ยานพาหนะ') || query.includes('รถ') || query.includes('fleet') || query.includes('vehicle')) {
      relevantContext += `\n## ข้อมูลฝูงยานพาหนะ
- ยานพาหนะทั้งหมด: ${contextData.fleetData.totalVehicles} คัน
- ยานพาหนะว่าง: ${contextData.fleetData.availableVehicles} คัน
- ยานพาหนะที่เช่าอยู่: ${contextData.fleetData.rentedVehicles} คัน
- ยานพาหนะในการบำรุงรักษา: ${contextData.fleetData.maintenanceVehicles} คัน`;
    }

    // Check for reservation-related queries
    if (query.includes('จอง') || query.includes('การเช่า') || query.includes('reservation') || query.includes('booking')) {
      relevantContext += `\n## ข้อมูลการจอง
- การจองทั้งหมด: ${contextData.reservationData.totalReservations} รายการ
- การจองที่ใช้งานอยู่: ${contextData.reservationData.activeReservations} รายการ
- การจองที่จะมาถึง: ${contextData.reservationData.upcomingReservations} รายการ`;
    }

    // Check for supply chain queries
    if (query.includes('การขนส่ง') || query.includes('ซัพพลายเชน') || query.includes('shipment') || query.includes('supply chain') || query.includes('ล่าช้า') || query.includes('delay')) {
      relevantContext += `\n## ข้อมูลซัพพลายเชน
- การขนส่งทั้งหมด: ${contextData.supplyChainData.totalShipments} รายการ
- การขนส่งที่กำลังดำเนินการ: ${contextData.supplyChainData.activeShipments} รายการ
- การขนส่งที่ล่าช้า: ${contextData.supplyChainData.delayedShipments} รายการ`;
    }

    // Check for analytics queries
    if (query.includes('วิเคราะห์') || query.includes('ประสิทธิภาพ') || query.includes('analytics') || query.includes('performance') || query.includes('ท่าเรือ') || query.includes('port')) {
      relevantContext += `\n## ข้อมูลการวิเคราะห์
- การขนส่งทั้งหมด: ${contextData.supplyChainData.totalShipments} รายการ
- การขนส่งที่กำลังดำเนินการ: ${contextData.supplyChainData.activeShipments} รายการ
- การขนส่งที่ล่าช้า: ${contextData.supplyChainData.delayedShipments} รายการ
- จำนวนท่าเรือที่ติดตาม: ${contextData.supplyChainData.portMetrics.length} ท่าเรือ`;
    }

    // If no specific keywords found, provide general overview
    if (!relevantContext) {
      relevantContext = this.formatContextForAI(contextData);
    }

    return relevantContext;
  }
};