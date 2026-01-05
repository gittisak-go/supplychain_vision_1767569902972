import type { Metadata } from 'next';
import { NavigationProvider } from '@/components/common/SidebarNavigation';
import SidebarNavigation from '@/components/common/SidebarNavigation';
import MobileNavigation from '@/components/common/MobileNavigation';
import Header from '@/components/common/Header';
import SupplyChainOverviewInteractive from './components/SupplyChainOverviewInteractive';

export const metadata: Metadata = {
  title: 'ภาพรวมโซ่อุปทาน - GtsAlpha :Ghost Tracker',
  description: 'แดชบอร์ดการมองเห็นโซ่อุปทานแบบครบวงจรพร้อมการติดตามการจัดส่งแบบเรียลไทม์ การปรับเส้นทางให้เหมาะสม แลวการตรวจสอบประสิทธิภาพการขนส่ง',
};

export default function SupplyChainOverviewPage() {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-background">
        <SidebarNavigation />
        <MobileNavigation />
        
        <div className="lg:ml-60 transition-layout">
          <Header />
          
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Supply Chain Overview
                </h1>
                <p className="text-muted-foreground">
                  Real-time visibility into global logistics operations and performance metrics
                </p>
              </div>
              
              <SupplyChainOverviewInteractive />
            </div>
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}