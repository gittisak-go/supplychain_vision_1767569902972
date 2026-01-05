'use client';

import React from 'react';
import { NavigationProvider } from '../common/SidebarNavigation';

interface NavigationProviderWrapperProps {
  children: React.ReactNode;
}

export default function NavigationProviderWrapper({ children }: NavigationProviderWrapperProps) {
  return (
    <NavigationProvider>
      {children}
    </NavigationProvider>
  );
}