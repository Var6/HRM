'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeNavbar from '@/components/employee/EmployeeNavbar';

interface EmployeeData {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  mobileNumber: string;
}

interface EmployeeFullData extends EmployeeData {
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    branchName?: string;
  };
  salaryStructure?: {
    basicSalary?: number;
    hra?: number;
    conveyance?: number;
  };
}

export default function EmployeeProfile() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [fullEmployeeData, setFullEmployeeData] = useState<EmployeeFullData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData');
    
    if (!employeeData) {
      router.push('/employee/login');
      return;
    }

    const parsedEmployee = JSON.parse(employeeData);
    setEmployee(parsedEmployee);
    // Initialize fullEmployeeData with parsed employee immediately
    setFullEmployeeData(parsedEmployee as EmployeeFullData);

    // Fetch full employee details to get additional data
    fetchEmployeeDetails(parsedEmployee._id);
  }, [router]);

  const fetchEmployeeDetails = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      const data = await response.json();

      if (data.success && data.employee) {
        setFullEmployeeData(data.employee);
      } else {
        // If API fails, use basic employee data from localStorage
        setFullEmployeeData(JSON.parse(localStorage.getItem('employeeData') || '{}'));
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      // Fallback: use data from localStorage
      setFullEmployeeData(JSON.parse(localStorage.getItem('employeeData') || '{}'));
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const fullName = `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeNavbar employeeName={fullName} employeeCode={employee?.employeeCode || ''} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-600 mt-1">View your personal and professional information</p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="text-center">
                {(fullEmployeeData?.photograph) ? (
                  <img 
                    src={fullEmployeeData.photograph} 
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover mb-4 mx-auto border-4 border-blue-100"
                  />
                ) : (
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold mb-4">
                    {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-800">{fullName}</h2>
                <p className="text-slate-600 mt-1">{fullEmployeeData.designation}</p>
                <p className="text-sm text-slate-500 mt-1">{fullEmployeeData.employeeCode}</p>
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-slate-600 wrap-break-word">{fullEmployeeData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-slate-600">{fullEmployeeData.mobileNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-slate-600">{fullEmployeeData.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Date of Birth</label>
                  <p className="text-slate-800 mt-1">
                    {fullEmployeeData.dateOfBirth 
                      ? new Date(fullEmployeeData.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Gender</label>
                  <p className="text-slate-800 mt-1 capitalize">{fullEmployeeData?.gender || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-500">Address</label>
                  <p className="text-slate-800 mt-1">
                    {fullEmployeeData.address 
                      ? `${fullEmployeeData.address}, ${fullEmployeeData.city || ''}, ${fullEmployeeData.state || ''} - ${fullEmployeeData.pincode || ''}`
                      : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Employee Code</label>
                  <p className="text-slate-800 mt-1 font-mono">{fullEmployeeData.employeeCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Joining Date</label>
                  <p className="text-slate-800 mt-1">
                    {fullEmployeeData?.joiningDate || fullEmployeeData?.dateOfJoining
                      ? (() => {
                          const date = new Date(fullEmployeeData.joiningDate || fullEmployeeData.dateOfJoining);
                          return date.getTime ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not provided';
                        })()
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Department</label>
                  <p className="text-slate-800 mt-1">{fullEmployeeData.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Designation</label>
                  <p className="text-slate-800 mt-1">{fullEmployeeData.designation}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {fullEmployeeData.emergencyContact && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Name</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData.emergencyContact.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Relation</label>
                    <p className="text-slate-800 mt-1 capitalize">{fullEmployeeData.emergencyContact.relation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Phone</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData.emergencyContact.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            {fullEmployeeData.bankDetails && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Account Number</label>
                    <p className="text-slate-800 mt-1 font-mono">{fullEmployeeData.bankDetails.accountNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Bank Name</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData.bankDetails.bankName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">IFSC Code</label>
                    <p className="text-slate-800 mt-1 font-mono">{fullEmployeeData.bankDetails.ifscCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Branch</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData.bankDetails.branchName || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
