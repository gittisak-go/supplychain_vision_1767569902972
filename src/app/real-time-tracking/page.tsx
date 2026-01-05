import type { Metadata } from 'next';
import { NavigationProvider } from '@/components/common/SidebarNavigation';
import Header from '@/components/common/Header';
import SidebarNavigation from '@/components/common/SidebarNavigation';
import MobileNavigation from '@/components/common/MobileNavigation';
import RealTimeTrackingInteractive from './components/RealTimeTrackingInteractive';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Real-Time Tracking - SupplyChain Vision',
  description: 'Monitor live shipment status, route performance analytics, and disruption alerts for proactive logistics management and decision-making.',
};

export default function RealTimeTrackingPage() {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header />
        
        {/* Sidebar Navigation */}
        <SidebarNavigation />
        
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        {/* Main Content */}
        <main className="lg:ml-60 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-3">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Real-Time Tracking
              </h1>
              <p className="text-muted-foreground">
                Monitor live shipment status and route performance
              </p>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth">
                  <Icon name="PlusIcon" size={16} />
                  <span className="text-sm font-medium">Add Shipment</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-smooth">
                  <Icon name="ArrowPathIcon" size={16} />
                  <span className="text-sm font-medium">Refresh Data</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-smooth">
                  <Icon name="DocumentTextIcon" size={16} />
                  <span className="text-sm font-medium">Generate Report</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-smooth">
                  <Icon name="BellIcon" size={16} />
                  <span className="text-sm font-medium">Set Alert</span>
                </button>
              </div>
            </div>
            
            <RealTimeTrackingInteractive />
          </div>
        </main>
      </div>
    </NavigationProvider>
  );
}