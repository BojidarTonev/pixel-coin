'use client'

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen">
      <Toaster />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? "ml-[240px]" : "ml-[80px]"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 