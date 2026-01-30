'use client';
import React, { useState } from 'react';
import { 
  User, ArrowLeft, Edit, Trash2, Download, Mail, Phone, MapPin,
  Calendar, Briefcase, DollarSign, CreditCard, FileText, Award,
  AlertCircle, CheckCircle, Building, Clock, TrendingUp, Users,
  BookOpen, IdCard, Book, Package, ChevronDown, ChevronUp,
  XCircle, AlertTriangle, Info, Save, X, Plus, Printer
} from 'lucide-react';
import Link from 'next/link';

// Mock employee data - In production, fetch this using the ID from params
const mockEmployeeData = {
  id: 1,
  // Personal Information
  name: 'Rajesh Kumar',
  photograph: null,
  dateOfBirth: '1995-03-15',
  fatherName: 'Suresh Kumar',
  motherName: 'Anita Devi',
  spouseName: 'Priya Kumar',
  category: 'General',
  fatherOccupation: 'Farmer',
  permanentAddress: 'Village Dumraon, Post Office Dumraon, District Buxar, Bihar - 802136',
  correspondenceAddress: 'Flat 302, Green Valley Apartments, Bailey Road, Patna, Bihar - 800014',
  contactNo: '+91 98765 43210',
  bloodGroup: 'B+',
  identificationMark: 'Mole on left cheek',
  panCardNo: 'ABCDE1234F',
  aadharCardNo: '1234 5678 9012',
  drivingLicenseNo: 'BR0120230001234',
  maritalStatus: 'Married',
  educationQualification: 'B.Tech in Computer Science',
  
  // Work Experience
  workExperience: [
    { organization: 'Tech Solutions Pvt Ltd', designation: 'Junior Developer', periodOfStay: 'Jan 2020 - Dec 2022' },
    { organization: 'Digital Innovations', designation: 'Developer', periodOfStay: 'Jan 2023 - Dec 2023' }
  ],
  
  // Employment Details
  dateOfInterview: '2023-12-20',
  dateOfJoining: '2024-01-15',
  employeeCode: 'EMP001',
  department: 'Engineering',
  designation: 'Senior Developer',
  branchName: 'Patna',
  modeOfPayment: 'Bank Transfer',
  bankAccountNo: '1234567890123456',
  pfNo: 'PF123456',
  uanNo: 'UAN987654321',
  esiNo: 'ESI456789',
  exitDate: '',
  
  // Contact
  email: 'rajesh.kumar@company.com',
  mobileNumber: '+91 98765 43210',
  
  // Items Provided
  idCardProvided: true,
  diaryProvided: true,
  visitingCardProvided: false,
  
  // Salary Structure
  salary: {
    earnings: {
      basic: '50000',
      hra: '20000',
      conveyance: '5000',
      monthlyBonus: '5000',
      quarterlyBonus: '0',
      specialAllowance: '5000'
    },
    deductions: {
      pf: '6000',
      esic: '750',
      lop: '0',
      salaryAdvance: '0',
      loan: '0'
    }
  },
  
  // Leaves
  leaves: {
    casualLeave: 12,
    earnedLeave: 15,
    halfDayLeave: 2,
    sickLeave: 5,
    extraordinaryLeave: 0
  },
  
  // Leave Usage (example data)
  leaveUsage: {
    casualLeave: { used: 4, remaining: 8 },
    earnedLeave: { used: 6, remaining: 9 },
    halfDayLeave: { used: 1, remaining: 1 },
    sickLeave: { used: 2, remaining: 3 },
    extraordinaryLeave: { used: 0, remaining: 0 }
  },
  
  status: 'active',
  createdAt: '2024-01-15',
  
  // Notifications
  notifications: [
    { type: 'warning', message: 'Visiting card not yet provided', date: '2024-01-20' },
    { type: 'info', message: 'Appraisal due in March 2024', date: '2024-01-25' }
  ]
};

type NotificationType = 'error' | 'warning' | 'info' | 'success';

export default function EmployeeDetail() {
  const [employee] = useState(mockEmployeeData);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal', 'employment', 'salary']));

  // Calculate totals
  const totalEarnings = Object.values(employee.salary.earnings).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalDeductions = Object.values(employee.salary.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const netSalary = totalEarnings - totalDeductions;

  // Calculate tenure
  const joinDate = new Date(employee.dateOfJoining);
  const today = new Date();
  const tenureMonths = Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const tenureYears = Math.floor(tenureMonths / 12);
  const remainingMonths = tenureMonths % 12;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getNotificationStyle = (type: NotificationType) => {
    switch(type) {
      case 'error':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'success':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      case 'info':
      default:
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-7 mt-7">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/Dashboard/employees"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 mb-4 transition-colors hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Employees
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                {employee.photograph ? (
                  <img 
                    src={employee.photograph} 
                    alt={employee.name}
                    className="w-32 h-32 rounded-xl object-cover border-4 border-slate-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-4 border-slate-200">
                    <User className="w-16 h-16 text-cyan-600" />
                  </div>
                )}
              </div>

              {/* Employee Header Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-slate-900">{employee.name}</h1>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        {employee.status}
                      </span>
                    </div>
                    <p className="text-xl text-slate-600 mb-1">{employee.designation}</p>
                    <p className="text-slate-500">{employee.employeeCode} • {employee.department}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/employees/${employee.id}/edit`}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                    <Building className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-slate-500">Branch</p>
                      <p className="font-semibold text-slate-900">{employee.branchName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-slate-500">Joining Date</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(employee.dateOfJoining).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                    <Clock className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-slate-500">Tenure</p>
                      <p className="font-semibold text-slate-900">
                        {tenureYears > 0 ? `${tenureYears}y ` : ''}{remainingMonths}m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-slate-500">Net Salary</p>
                      <p className="font-semibold text-slate-900">₹{netSalary.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{employee.mobileNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-900">{employee.branchName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {employee.notifications.length > 0 && (
          <div className="mb-6 space-y-3">
            {employee.notifications.map((notification, idx) => {
              const style = getNotificationStyle(notification.type as NotificationType);
              const Icon = style.icon;
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 px-6 py-4 ${style.bg} border ${style.border} rounded-xl`}
                >
                  <Icon className={`w-6 h-6 flex-shrink-0 ${style.color}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${style.color}`}>{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notification.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('personal')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                </div>
                {expandedSections.has('personal') ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSections.has('personal') && (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                      <p className="font-medium text-slate-900">
                        {new Date(employee.dateOfBirth).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Blood Group</p>
                      <p className="font-medium text-slate-900">{employee.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Father's Name</p>
                      <p className="font-medium text-slate-900">{employee.fatherName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Mother's Name</p>
                      <p className="font-medium text-slate-900">{employee.motherName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Father's Occupation</p>
                      <p className="font-medium text-slate-900">{employee.fatherOccupation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Marital Status</p>
                      <p className="font-medium text-slate-900">{employee.maritalStatus}</p>
                    </div>
                    {employee.spouseName && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Spouse Name</p>
                        <p className="font-medium text-slate-900">{employee.spouseName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Category</p>
                      <p className="font-medium text-slate-900">{employee.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Education</p>
                      <p className="font-medium text-slate-900">{employee.educationQualification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Identification Mark</p>
                      <p className="font-medium text-slate-900">{employee.identificationMark}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-500 mb-1">Permanent Address</p>
                      <p className="font-medium text-slate-900">{employee.permanentAddress}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-500 mb-1">Correspondence Address</p>
                      <p className="font-medium text-slate-900">{employee.correspondenceAddress}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('employment')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-slate-900">Employment Details</h2>
                </div>
                {expandedSections.has('employment') ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSections.has('employment') && (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Employee Code</p>
                      <p className="font-medium text-slate-900">{employee.employeeCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Department</p>
                      <p className="font-medium text-slate-900">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Designation</p>
                      <p className="font-medium text-slate-900">{employee.designation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Branch</p>
                      <p className="font-medium text-slate-900">{employee.branchName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date of Interview</p>
                      <p className="font-medium text-slate-900">
                        {employee.dateOfInterview ? new Date(employee.dateOfInterview).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date of Joining</p>
                      <p className="font-medium text-slate-900">
                        {new Date(employee.dateOfJoining).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Mode of Payment</p>
                      <p className="font-medium text-slate-900">{employee.modeOfPayment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Bank Account No.</p>
                      <p className="font-medium text-slate-900">{employee.bankAccountNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">PF Number</p>
                      <p className="font-medium text-slate-900">{employee.pfNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">UAN Number</p>
                      <p className="font-medium text-slate-900">{employee.uanNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">ESI Number</p>
                      <p className="font-medium text-slate-900">{employee.esiNo || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('experience')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-slate-900">Previous Work Experience</h2>
                </div>
                {expandedSections.has('experience') ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSections.has('experience') && (
                <div className="p-6">
                  <div className="space-y-4">
                    {employee.workExperience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">{exp.organization}</h3>
                          <span className="text-sm text-slate-500">{exp.periodOfStay}</span>
                        </div>
                        <p className="text-slate-600">{exp.designation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Salary Structure */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('salary')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-slate-900">Salary Structure</h2>
                </div>
                {expandedSections.has('salary') ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSections.has('salary') && (
                <div className="p-6">
                  {/* Earnings */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Earnings
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(employee.salary.earnings).map(([key, value]) => (
                        value && parseFloat(value) > 0 && (
                          <div key={key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-semibold text-green-700">₹{parseFloat(value).toLocaleString('en-IN')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Deductions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(employee.salary.deductions).map(([key, value]) => (
                        value && parseFloat(value) > 0 && (
                          <div key={key} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 uppercase">{key}</span>
                            <span className="font-semibold text-red-700">₹{parseFloat(value).toLocaleString('en-IN')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
                        <p className="text-2xl font-bold text-red-600">₹{totalDeductions.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Net Salary</p>
                        <p className="text-2xl font-bold text-cyan-600">₹{netSalary.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-slate-900">Documents & IDs</h2>
                </div>
                {expandedSections.has('documents') ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSections.has('documents') && (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">PAN Card</p>
                      <p className="font-medium text-slate-900">{employee.panCardNo || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Aadhar Card</p>
                      <p className="font-medium text-slate-900">{employee.aadharCardNo || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Driving License</p>
                      <p className="font-medium text-slate-900">{employee.drivingLicenseNo || 'Not provided'}</p>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Items Provided</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${employee.idCardProvided ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <IdCard className={`w-5 h-5 ${employee.idCardProvided ? 'text-green-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">ID Card</p>
                          <p className={`text-xs ${employee.idCardProvided ? 'text-green-600' : 'text-slate-500'}`}>
                            {employee.idCardProvided ? 'Provided' : 'Not Provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${employee.diaryProvided ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <Book className={`w-5 h-5 ${employee.diaryProvided ? 'text-green-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Diary</p>
                          <p className={`text-xs ${employee.diaryProvided ? 'text-green-600' : 'text-slate-500'}`}>
                            {employee.diaryProvided ? 'Provided' : 'Not Provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${employee.visitingCardProvided ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 ${employee.visitingCardProvided ? 'text-green-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Visiting Card</p>
                          <p className={`text-xs ${employee.visitingCardProvided ? 'text-green-600' : 'text-slate-500'}`}>
                            {employee.visitingCardProvided ? 'Provided' : 'Not Provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Leave & Quick Info */}
          <div className="space-y-6">
            
            {/* Leave Balance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-cyan-600" />
                Leave Balance
              </h2>
              
              <div className="space-y-3">
                {Object.entries(employee.leaveUsage).map(([key, data]) => {
                  const total = employee.leaves[key as keyof typeof employee.leaves];
                  const percentage = (data.used / total) * 100;
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {data.used}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{data.remaining} days remaining</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all text-left flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  Download Employee Card
                </button>
                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all text-left flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  Generate Salary Slip
                </button>
                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all text-left flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  Send Email
                </button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Salary processed</p>
                    <p className="text-xs text-slate-500">January 1, 2024</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Leave approved</p>
                    <p className="text-xs text-slate-500">December 15, 2023</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Employee record updated</p>
                    <p className="text-xs text-slate-500">December 1, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}