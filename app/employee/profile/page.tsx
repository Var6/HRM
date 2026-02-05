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
  name?: string;
  employeeName?: string;
  photograph?: string;
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: string;
  correspondenceAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  fatherName?: string;
  motherName?: string;
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
                <p className="text-slate-600 mt-1">{fullEmployeeData?.designation || 'Not provided'}</p>
                <p className="text-sm text-slate-500 mt-1">{fullEmployeeData?.employeeCode}</p>
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-slate-600 wrap-break-word">{fullEmployeeData?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-slate-600">{fullEmployeeData?.mobileNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-slate-600">{fullEmployeeData?.department || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Missing Mandatory Fields Warning */}
            {(!fullEmployeeData?.gender || !fullEmployeeData?.permanentAddress && !fullEmployeeData?.correspondenceAddress && !fullEmployeeData?.address) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9a2 2 0 01-2 2h-.5a1 1 0 00-1 1v1a1 1 0 001 1h.5a2 2 0 012 2v2.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 01-.707.293H12a2 2 0 01-2-2v-2.5a1 1 0 00-1-1h-1a1 1 0 00-1 1v2.5a2 2 0 01-2 2H6a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 012 18.586V16a2 2 0 012-2h.5a1 1 0 001-1v-1a1 1 0 00-1-1H4a2 2 0 01-2-2V9.414a1 1 0 01.293-.707l2.414-2.414A1 1 0 016.414 6H8a2 2 0 012-2z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800">Complete Your Profile</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please update your {!fullEmployeeData?.gender && 'Gender'}{!fullEmployeeData?.gender && (!fullEmployeeData?.permanentAddress && !fullEmployeeData?.correspondenceAddress && !fullEmployeeData?.address) && ' and '}{!fullEmployeeData?.permanentAddress && !fullEmployeeData?.correspondenceAddress && !fullEmployeeData?.address && 'Address'} information to complete your profile.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    {fullEmployeeData?.dateOfBirth 
                      ? new Date(fullEmployeeData.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 flex items-center">
                    Gender
                    {!fullEmployeeData?.gender && <span className="ml-2 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded">Required</span>}
                  </label>
                  <p className={`text-slate-800 mt-1 capitalize ${!fullEmployeeData?.gender ? 'text-yellow-600 font-semibold' : ''}`}>
                    {fullEmployeeData?.gender || 'Not provided - Please update'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-500 flex items-center">
                    Address
                    {!fullEmployeeData?.permanentAddress && !fullEmployeeData?.correspondenceAddress && !fullEmployeeData?.address && <span className="ml-2 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded">Required</span>}
                  </label>
                  <p className={`text-slate-800 mt-1 ${(!fullEmployeeData?.permanentAddress && !fullEmployeeData?.correspondenceAddress && !fullEmployeeData?.address) ? 'text-yellow-600 font-semibold' : ''}`}>
                    {fullEmployeeData?.permanentAddress || fullEmployeeData?.correspondenceAddress || fullEmployeeData?.address 
                      ? `${fullEmployeeData?.permanentAddress || fullEmployeeData?.correspondenceAddress || fullEmployeeData?.address}${fullEmployeeData?.city ? ', ' + fullEmployeeData.city : ''}${fullEmployeeData?.state ? ', ' + fullEmployeeData.state : ''}${fullEmployeeData?.pincode ? ' - ' + fullEmployeeData.pincode : ''}`
                      : 'Not provided - Please update'}
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
                  <p className="text-slate-800 mt-1 font-mono">{fullEmployeeData?.employeeCode || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Joining Date</label>
                  <p className="text-slate-800 mt-1">
                    {fullEmployeeData?.joiningDate
                      ? new Date(fullEmployeeData.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Department</label>
                  <p className="text-slate-800 mt-1">{fullEmployeeData?.department || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Designation</label>
                  <p className="text-slate-800 mt-1">{fullEmployeeData?.designation || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {fullEmployeeData?.emergencyContact && (
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
                    <p className="text-slate-800 mt-1">{fullEmployeeData?.emergencyContact?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Relation</label>
                    <p className="text-slate-800 mt-1 capitalize">{fullEmployeeData?.emergencyContact?.relation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Phone</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData?.emergencyContact?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            {fullEmployeeData?.bankDetails && (
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
                    <p className="text-slate-800 mt-1 font-mono">{fullEmployeeData?.bankDetails?.accountNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Bank Name</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData?.bankDetails?.bankName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">IFSC Code</label>
                    <p className="text-slate-800 mt-1 font-mono">{fullEmployeeData?.bankDetails?.ifscCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Branch</label>
                    <p className="text-slate-800 mt-1">{fullEmployeeData?.bankDetails?.branchName || 'Not provided'}</p>
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
