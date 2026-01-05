'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useNavigation } from './SidebarNavigation';

interface MobileNavToggleProps {
  className?: string;
}

const MobileNavToggle = ({ className = '' }: MobileNavToggleProps) => {
  const { mobileMenuOpen, setMobileMenuOpen } = useNavigation();

  return (
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className={`
        lg:hidden flex items-center justify-center w-10 h-10 
        text-foreground hover:bg-muted rounded-lg transition-smooth
        ${className}
      `}
      aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
    >
      <Icon 
        name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} 
        size={24} 
      />
    </button>
  );
};

export default MobileNavToggle;