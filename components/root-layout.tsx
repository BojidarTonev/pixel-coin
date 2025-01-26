'use client'

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar onStateChange={setIsSidebarOpen} />
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {children}
      </main>
    </div>
  );
} 