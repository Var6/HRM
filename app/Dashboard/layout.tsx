'use client';

import React from 'react';
import Sidebar from '@/components/ui/sidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import { ToastProvider } from '@/components/ui/ToastProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Right column: global header + page content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Global Header — notification bell always visible on every Dashboard page */}
          <header className="shrink-0 bg-white border-b border-slate-200 shadow-sm px-6 py-3 flex items-center justify-end gap-2">
            <NotificationBell />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
