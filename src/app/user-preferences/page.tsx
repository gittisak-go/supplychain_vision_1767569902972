'use client';

import React from 'react';
import { NavigationProvider } from '@/components/common/SidebarNavigation';
import Header from '@/components/common/Header';
import SidebarNavigation from '@/components/common/SidebarNavigation';
import MobileNavigation from '@/components/common/MobileNavigation';
import UserPreferencesInteractive from './components/UserPreferencesInteractive';

export default function UserPreferencesPage() {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <SidebarNavigation />
        <MobileNavigation />
        
        <main className="lg:ml-60 pt-16">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-8">User Preferences</h1>
            <UserPreferencesInteractive />
          </div>
        </main>
      </div>
    </NavigationProvider>
  );
}