'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EmployeeNavbarProps {
  employeeName: string;
  employeeCode: string;
}

export default function EmployeeNavbar({ employeeName, employeeCode }: EmployeeNavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('employeeData');
    router.push('/employee/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">CSCC Society</h1>
                <p className="text-xs text-slate-500">Employee Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/employee/dashboard"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/employee/profile"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Profile
            </Link>
            <Link 
              href="/employee/leaves"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Leave Requests
            </Link>
            <Link 
              href="/employee/data-requests"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Data Requests
            </Link>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{employeeName}</p>
              <p className="text-xs text-slate-500">{employeeCode}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
