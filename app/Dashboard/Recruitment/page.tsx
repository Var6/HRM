'use client';
import React, { useState } from 'react';
import { 
  User, Camera, Calendar, Users, MapPin, Phone, Mail, CreditCard,
  Briefcase, Building, DollarSign, Save, X, Plus, Trash2, AlertCircle,
  CheckCircle, FileText, Upload, Eye, EyeOff, ChevronDown, Book, IdCard
} from 'lucide-react';
import type { EmployeeFormData, WorkExperience, ActiveTab } from '@/types/types';

const emptyEmployee: EmployeeFormData = {
  name: '',
  photograph: null,
  dateOfBirth: '',
  fatherName: '',
  motherName: '',
  spouseName: '',
  category: '',
  fatherOccupation: '',
  permanentAddress: '',
  correspondenceAddress: '',
  EcontactNo: '',
  bloodGroup: '',
  identificationMark: '',
  panCardNo: '',
  aadharCardNo: '',
  drivingLicenseNo: '',
  maritalStatus: '',
  educationQualification: '',

  workExperience: [{ organization: '', designation: '', periodOfStay: '' }],

  dateOfInterview: '',
  dateOfJoining: '',
  employeeCode: '',
  department: '',
  designation: '',
  branchName: '',
  modeOfPayment: '',
  bankAccountNo: '',
  pfNo: '',
  uanNo: '',
  esiNo: '',
  exitDate: '',

  email: '',
  mobileNumber: '',

  idCardProvided: false,
  diaryProvided: false,
  visitingCardProvided: false,
  emailProvided: '',
  mobileNumberProvided: '',

  salary: {
    earnings: {
      basic: '',
      hra: '',
      conveyance: '',
      monthlyBonus: '',
      quarterlyBonus: '',
      specialAllowance: ''
    },
    deductions: {
      pf: '',
      esic: '',
      lop: '',
      salaryAdvance: '',
      loan: ''
    }
  },

  leaves: {
    casualLeave: 12,
    earnedLeave: 15,
    halfDayLeave: 0,
    sickLeave: 0,
    extraordinaryLeave: 0
  }
};

export default function CreateEmployee() {
  const [formData, setFormData] = useState<EmployeeFormData>(emptyEmployee);

  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sameAsPermAddress, setSameAsPermAddress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  

  // Handle input changes
const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value, type, checked } = e.target as HTMLInputElement;

  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};


  // Handle nested salary changes
 const handleSalaryChange = (
  category: 'earnings' | 'deductions',
  field: string,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    salary: {
      ...prev.salary,
      [category]: {
        ...prev.salary[category],
        [field]: value
      }
    }
  }));
};


  // Handle work experience changes
const handleWorkExperienceChange = (
  index: number,
  field: keyof WorkExperience,
  value: string
) => {
  setFormData(prev => {
    const updated = [...prev.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    return { ...prev, workExperience: updated };
  });
};

  // Add new work experience entry
  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { organization: '', designation: '', periodOfStay: '' }]
    }));
  };

  // Remove work experience entry
  const removeWorkExperience = (index: number) => {
    const updatedExperience = formData.workExperience.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      workExperience: updatedExperience
    }));
  };

  // Handle photo upload
const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: form });

if (!res.ok) {
  console.error('Image upload failed');
  return;
}

const text = await res.text();
if (!text) {
  console.error('Empty upload response');
  return;
}

const data = JSON.parse(text);

setFormData(prev => ({ ...prev, photograph: data.url }));
setPhotoPreview(data.url);

};


React.useEffect(() => {
  const id = window.location.pathname.split('/').pop();
  if (!id || id === 'create') {
    setFormData(emptyEmployee);
    return;
  }

  setEmployeeId(id);
  setIsEditMode(true);

  const fetchEmployee = async () => {
  const res = await fetch(`/api/employees/${id}`);

  if (!res.ok) {
    console.error('Failed to fetch employee');
    return;
  }

  const text = await res.text();
  if (!text) {
    console.error('Empty response from server');
    return;
  }

  const data = JSON.parse(text);
  setFormData(data);
  setPhotoPreview(data.photograph || null);
};


  fetchEmployee();
}, []);

  // Copy permanent address to correspondence address
React.useEffect(() => {
  if (sameAsPermAddress) {
    setFormData(prev => ({
      ...prev,
      correspondenceAddress: prev.permanentAddress
    }));
  }
}, [sameAsPermAddress]);



  // Handle form submission
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!formData) return;

  const method = isEditMode ? 'PUT' : 'POST';
  const url = isEditMode ? `/api/employees/${employeeId}` : '/api/employees';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  setShowSuccess(true);
  setTimeout(() => setShowSuccess(false), 3000);
};


  // Tab navigation
 const tabs: { id: ActiveTab; label: string; icon: any }[] = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'experience', label: 'Experience', icon: FileText },
  { id: 'salary', label: 'Salary', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: IdCard },
];


  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 pt-7">
  <div className="w-full px-6 flex flex-col h-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{isEditMode ? 'Edit Employee' : 'Create New Employee'}</h1>
              <p className="text-slate-600">Fill in the employee details to add them to the system</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                type="submit"
                form="employee-form"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <Save className="w-5 h-5" />
                {isEditMode ? 'Update Employee' : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">
  {isEditMode ? 'Employee Updated Successfully!' : 'Employee Created Successfully!'}
</h4>

              <p className="text-sm text-green-700">The employee has been added to the database.</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 border-b-0 p-2 sticky top-0 z-20">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
               onClick={() => setActiveTab(tab.id)}


                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
  id="employee-form"
  onSubmit={handleSubmit}
  className="bg-white rounded-b-2xl border border-slate-200 p-8 shadow-sm flex-1 overflow-y-auto"
>
          
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-cyan-600" />
                  Personal Information
                </h3>

                {/* Photo Upload */}
                <div className="mb-8 flex items-center gap-6">
                  <div className="relative">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-xl object-cover border-4 border-slate-200" />
                    ) : (
                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-4 border-slate-200">
                        <Camera className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-lg cursor-pointer hover:bg-cyan-600 transition-all shadow-lg">
                      <Upload className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Employee Photograph</h4>
                    <p className="text-sm text-slate-600">Upload a clear passport-size photo</p>
                    <p className="text-xs text-slate-500 mt-1">Recommended: 300x300px, Max 2MB</p>
                  </div>
                </div>

                {/* Basic Details */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mother's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Father's Occupation
                    </label>
                    <input
                      type="text"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleInputChange}
                      placeholder="Enter occupation"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Spouse Name
                    </label>
                    <input
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleInputChange}
                      placeholder="Enter spouse name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Emergency Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="EcontactNo"
                      value={formData.EcontactNo}
                      onChange={handleInputChange}
                      placeholder="Enter Emergency Contact Number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Identification Mark
                    </label>
                    <input
                      type="text"
                      name="identificationMark"
                      value={formData.identificationMark}
                      onChange={handleInputChange}
                      placeholder="Enter identification mark"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Education Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="educationQualification"
                      value={formData.educationQualification}
                      onChange={handleInputChange}
                      placeholder="e.g., B.Tech, MBA"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="mt-8 space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                    Address Details
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Permanent Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter permanent address"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPermAddress}
                        onChange={(e) => setSameAsPermAddress(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Same as Permanent Address</span>
                    </label>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Correspondence Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="correspondenceAddress"
                      value={formData.correspondenceAddress}
                      onChange={handleInputChange}
                      placeholder="Enter correspondence address"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                      disabled={sameAsPermAddress}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment Details Tab */}
          {activeTab === 'employment' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-cyan-600" />
                  Employment Details
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Employee Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleInputChange}
                      placeholder="e.g., EMP001"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date of Interview
                    </label>
                    <input
                      type="date"
                      name="dateOfInterview"
                      value={formData.dateOfInterview}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date of Joining <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="Enter designation"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      placeholder="Enter branch name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mode of Payment <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="modeOfPayment"
                      value={formData.modeOfPayment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Mode</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      name="bankAccountNo"
                      value={formData.bankAccountNo}
                      onChange={handleInputChange}
                      placeholder="Enter bank account number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      PF Number
                    </label>
                    <input
                      type="text"
                      name="pfNo"
                      value={formData.pfNo}
                      onChange={handleInputChange}
                      placeholder="Enter PF number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      UAN Number
                    </label>
                    <input
                      type="text"
                      name="uanNo"
                      value={formData.uanNo}
                      onChange={handleInputChange}
                      placeholder="Enter UAN number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      ESI Number
                    </label>
                    <input
                      type="text"
                      name="esiNo"
                      value={formData.esiNo}
                      onChange={handleInputChange}
                      placeholder="Enter ESI number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Exit Date
                    </label>
                    <input
                      type="date"
                      name="exitDate"
                      value={formData.exitDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Work Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-600" />
                  Previous Work Experience
                </h3>
                <button
                  type="button"
                  onClick={addWorkExperience}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Experience
                </button>
              </div>

              {formData.workExperience.map((exp, index) => (
                <div key={index} className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Experience #{index + 1}</h4>
                    {formData.workExperience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWorkExperience(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={exp.organization}
                        onChange={(e) => handleWorkExperienceChange(index, 'organization', e.target.value)}
                        placeholder="Enter organization name"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={exp.designation}
                        onChange={(e) => handleWorkExperienceChange(index, 'designation', e.target.value)}
                        placeholder="Enter designation"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Period of Stay
                      </label>
                      <input
                        type="text"
                        value={exp.periodOfStay}
                        onChange={(e) => handleWorkExperienceChange(index, 'periodOfStay', e.target.value)}
                        placeholder="e.g., Jan 2020 - Dec 2022"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Salary Tab */}
          {activeTab === 'salary' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-cyan-600" />
                Salary Structure
              </h3>

              {/* Earnings */}
              <div>
                <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Earnings
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Basic</label>
                    <input
                      type="number"
                      value={formData.salary.earnings.basic}
                      onChange={(e) => handleSalaryChange('earnings', 'basic', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">HRA</label>
                    <input
                      type="number"
                      value={formData.salary.earnings.hra}
                      onChange={(e) => handleSalaryChange('earnings', 'hra', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Conveyance</label>
                    <input
                      type="number"
                      value={formData.salary.earnings.conveyance}
                      onChange={(e) => handleSalaryChange('earnings', 'conveyance', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Bonus</label>
                    <input
                      type="number"
                      value={formData.salary.earnings.monthlyBonus}
                      onChange={(e) => handleSalaryChange('earnings', 'monthlyBonus', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Quarterly Bonus</label>
                    <input
                      type="number"
                      value={formData.salary.earnings.quarterlyBonus}
                      onChange={(e) => handleSalaryChange('earnings', 'quarterlyBonus', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Special Allowance</label>
                    <input
                      type="number"
                      value={formData.salary.earnings.specialAllowance}
                      onChange={(e) => handleSalaryChange('earnings', 'specialAllowance', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Deductions
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">PF</label>
                    <input
                      type="number"
                      value={formData.salary.deductions.pf}
                      onChange={(e) => handleSalaryChange('deductions', 'pf', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ESIC</label>
                    <input
                      type="number"
                      value={formData.salary.deductions.esic}
                      onChange={(e) => handleSalaryChange('deductions', 'esic', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">LOP</label>
                    <input
                      type="number"
                      value={formData.salary.deductions.lop}
                      onChange={(e) => handleSalaryChange('deductions', 'lop', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Salary Advance</label>
                    <input
                      type="number"
                      value={formData.salary.deductions.salaryAdvance}
                      onChange={(e) => handleSalaryChange('deductions', 'salaryAdvance', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Loan</label>
                    <input
                      type="number"
                      value={formData.salary.deductions.loan}
                      onChange={(e) => handleSalaryChange('deductions', 'loan', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Summary */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Salary Summary</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{Object.values(formData.salary.earnings).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{Object.values(formData.salary.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Net Salary</p>
                    <p className="text-2xl font-bold text-cyan-600">
                      ₹{(
                        Object.values(formData.salary.earnings).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) -
                        Object.values(formData.salary.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-cyan-600" />
                Documents & IDs
              </h3>

              {/* Document Numbers */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    name="panCardNo"
                    value={formData.panCardNo}
                    onChange={handleInputChange}
                    placeholder="Enter PAN number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Aadhar Card Number
                  </label>
                  <input
                    type="text"
                    name="aadharCardNo"
                    value={formData.aadharCardNo}
                    onChange={handleInputChange}
                    placeholder="Enter Aadhar number"
                    maxLength={12}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    name="drivingLicenseNo"
                    value={formData.drivingLicenseNo}
                    onChange={handleInputChange}
                    placeholder="Enter DL number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Provided Items - Boolean Fields */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-600" />
                  Items Provided to Employee
                </h4>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* ID Card Checkbox */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:border-cyan-300 transition-all">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="idCardProvided"
                          checked={formData.idCardProvided}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-14 h-8 bg-slate-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 transition-all"></div>
                        <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-6"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <IdCard className="w-5 h-5 text-cyan-600" />
                          <span className="font-semibold text-slate-900">ID Card</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Employee ID card issued</p>
                      </div>
                    </label>
                  </div>

                  {/* Diary Checkbox */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:border-cyan-300 transition-all">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="diaryProvided"
                          checked={formData.diaryProvided}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-14 h-8 bg-slate-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 transition-all"></div>
                        <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-6"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Book className="w-5 h-5 text-cyan-600" />
                          <span className="font-semibold text-slate-900">Diary</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Company diary provided</p>
                      </div>
                    </label>

                  </div>

                  {/* Visiting Card Checkbox */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:border-cyan-300 transition-all">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="visitingCardProvided"
                          checked={formData.visitingCardProvided}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-14 h-8 bg-slate-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 transition-all"></div>
                        <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-6"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-cyan-600" />
                          <span className="font-semibold text-slate-900">Visiting Card</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Business cards issued</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-3">

                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 ">
                    Official Email Address
                  </label>
                  <input
                    type="text"
                    name="emailProvided"
                    value={formData.emailProvided}
                    onChange={handleInputChange}
                    placeholder="Enter Official Email Address"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                   Office Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobileNumberProvided"
                    value={formData.mobileNumberProvided}
                    onChange={handleInputChange}
                    placeholder="Enter Office Mobile Number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              </div>

              {/* Leave Allocation Info */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Default Leave Allocation</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Casual Leave (CL)</span>
                    <span className="text-lg font-bold text-cyan-600">12 days/year</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Earned Leave (EL)</span>
                    <span className="text-lg font-bold text-cyan-600">15 days/year</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Credited</span>
                    <span className="text-lg font-bold text-green-600">Monthly</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-4">
                  * CL: 1 day per completed month | EL: 1.25 days per completed month (credited on 1st of every month)
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}