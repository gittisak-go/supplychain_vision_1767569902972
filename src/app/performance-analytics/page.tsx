'use client';


import { useState } from 'react';
import SidebarNavigation from '@/components/common/SidebarNavigation';
import MobileNavigation from '@/components/common/MobileNavigation';
import Header from '@/components/common/Header';
import PerformanceAnalyticsInteractive from './components/PerformanceAnalyticsInteractive';

export default function PerformanceAnalyticsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MobileNavigation />
      
      <div className="lg:ml-60 transition-layout">
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Performance Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive KPI tracking and strategic insights for data-driven supply chain optimization
              </p>
            </div>
            
            <PerformanceAnalyticsInteractive />
          </div>
        </main>
      </div>
    </div>
  );
}