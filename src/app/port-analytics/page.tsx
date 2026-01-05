import type { Metadata } from 'next';
import PortAnalyticsInteractive from './components/PortAnalyticsInteractive';
import SidebarNavigation, { NavigationProvider } from '@/components/common/SidebarNavigation';
import MobileNavigation from '@/components/common/MobileNavigation';
import Header from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'Port Analytics - SupplyChain Vision',
  description: 'Monitor port capacity utilization, congestion status, and operational efficiency across multiple facilities with real-time analytics and bottleneck identification.',
};

export default function PortAnalyticsPage() {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar Navigation */}
        <SidebarNavigation />
        
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        {/* Main Content Area */}
        <div className="lg:ml-60 transition-layout">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="p-6">
            <PortAnalyticsInteractive />
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}