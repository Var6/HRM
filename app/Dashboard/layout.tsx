'use client';

import React from 'react';
import Sidebar from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto transition-all duration-300">
        {children}
      </main>

    </div>
  );
}
