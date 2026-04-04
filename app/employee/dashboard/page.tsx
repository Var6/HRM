'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeNavbar from '@/components/employee/EmployeeNavbar';
import Link from 'next/link';

interface EmployeeData {
  _id: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  employeeName?: string;
  email?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  mobileNumber?: string;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if employee is logged in
    const employeeData = localStorage.getItem('employeeData');
    
    if (!employeeData) {
      router.push('/employee/login');
      return;
    }

    const empData = JSON.parse(employeeData);
    setEmployee(empData);
    
    // Fetch full employee details from API to get the name field
    fetchEmployeeDetails(empData._id);
  }, []);

  const fetchEmployeeDetails = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        // Map the API response to ensure we have all name fields
        const mappedData = {
          ...data,
          employeeName: data.name || data.employeeName || '',
          firstName: data.name?.split(' ')[0] || data.firstName || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || data.lastName || ''
        };
        setEmployee(prev => prev ? { ...prev, ...mappedData } : mappedData);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Build full name from available fields - check 'name' field first (primary field in database)
  const fullName = employee?.name?.trim() 
    ? employee.name 
    : employee?.employeeName?.trim() 
    ? employee.employeeName 
    : (employee?.firstName || employee?.lastName)
    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
    : 'Employee';

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeNavbar employeeName={fullName} employeeCode={employee.employeeCode} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {fullName.split(' ')[0]}! 👋</h1>
          <p className="text-blue-100">
            Manage your profile, request leaves, and stay updated with your work information.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Link href="/employee/profile">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">My Profile</h3>
              <p className="text-sm text-slate-600">View and manage your personal information</p>
            </div>
          </Link>

          {/* Leave Requests Card */}
          <Link href="/employee/leaves">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Leave Requests</h3>
              <p className="text-sm text-slate-600">Apply for leave and track status</p>
            </div>
          </Link>

          {/* Data Change Requests Card */}
          <Link href="/employee/data-requests">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Data Requests</h3>
              <p className="text-sm text-slate-600">Request changes to your profile data</p>
            </div>
          </Link>

          {/* Payslips Card */}
          <Link href="/employee/payslips">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Payslips</h3>
              <p className="text-sm text-slate-600">Download your salary slips</p>
            </div>
          </Link>

          {/* Help & Support Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Help & Support</h3>
            <p className="text-sm text-slate-600">Contact HR for assistance</p>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Info */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Employee Code</span>
                <span className="font-semibold text-slate-800">{employee.employeeCode}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Department</span>
                <span className="font-semibold text-slate-800">{employee.department}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Designation</span>
                <span className="font-semibold text-slate-800">{employee.designation}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Joining Date</span>
                <span className="font-semibold text-slate-800">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'Not available'}
                </span>
              </div>
            </div>
          </div>

          {/* Important Links */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Important Information</h2>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Weekly Off:</span> Tuesday
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">HR Email:</span> hr@citizencooperative.in
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <span className="font-semibold">Support:</span> Available Mon-Sat, 9 AM - 6 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
