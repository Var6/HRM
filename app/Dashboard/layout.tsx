'use client';

import React from 'react';
import Sidebar from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
