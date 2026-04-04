// types/type.ts

export type WorkExperience = {
  organization: string;
  designation: string;
  periodOfStay: string;
};

export type SalaryBlock = {
  [key: string]: string;
};

export type ActiveTab =
  | 'personal'
  | 'employment'
  | 'experience'
  | 'salary'
  | 'documents';

export interface EmployeeFormData {
  /* ---------- Personal Details ---------- */
  name: string;
  photograph: File | null;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  category: string;
  fatherOccupation: string;
  permanentAddress: string;
  correspondenceAddress: string;
  EcontactNo: string;
  bloodGroup: string;
  identificationMark: string;
  panCardNo: string;
  aadharCardNo: string;
  drivingLicenseNo: string;
  maritalStatus: string;
  educationQualification: string;

  /* ---------- Work Experience ---------- */
  workExperience: WorkExperience[];

  /* ---------- Employment Details ---------- */
  dateOfInterview: string;
  dateOfJoining: string;
  employeeCode: string;
  department: string;
  designation: string;
  branchName: string;
  modeOfPayment: string;
  bankAccountNo: string;
  pfNo: string;
  uanNo: string;
  esiNo: string;
  exitDate: string;
  status: string;

  /* ---------- Contact ---------- */
  email: string;
  mobileNumber: string;

  /* ---------- Assets ---------- */
  emailProvided?: string;
  mobileNumberProvided?: string;
  idCardProvided: boolean;
  diaryProvided: boolean;
  visitingCardProvided: boolean;

  /* ---------- Salary ---------- */
  salary: {
    earnings: SalaryBlock;
    deductions: SalaryBlock;
  };

  /* ---------- Leave Balance ---------- */
  leaves: {
    casualLeave: number;
    earnedLeave: number;
    halfDayLeave: number;
    sickLeave: number;
    extraordinaryLeave: number;
  };
}
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type TaskStatus = 'in-progress' | 'completed' | 'paused';

export interface TimeEntry {
  id: number;
  date: string;
  project: string;
  task: string;
  startTime: string;
  endTime: string;
  hours: number;
  breakTime: number;
  description: string;
  status: TaskStatus;
  billable: boolean;
}

export interface DailyTimesheet {
  date: string;
  entries: TimeEntry[];
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: TimesheetStatus;
}

export interface WeeklyTimesheet {
  employeeId: number;
  employeeName: string;
  designation: string;
  department: string;
  weekStart: string;
  weekEnd: string;
  dailyTimesheets: DailyTimesheet[];
  totalWeekHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalBillableHours: number;
  status: TimesheetStatus;
  submittedDate?: string;
  approvedDate?: string;
  rejectionReason?: string;
}
export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'hold';
export type SalaryComponent = 'basic' | 'hra' | 'conveyance' | 'monthly_bonus' | 'quarterly_bonus' | 'special_allowance';
export type DeductionComponent = 'pf' | 'esic' | 'lop' | 'salary_advance' | 'loan' | 'tds';

export interface SalaryStructure {
  _id?: string; // MongoDB ObjectId
  employeeId: number | string;
  employeeName: string;
  photograph?: string | null;
  presentDays: number;
  employeeCode: string;
  designation: string;
  department: string;
  branch: string;
  fatherName?: string;
  dateOfJoining?: string;
  panNumber?: string;
  aadharNumber?: string;
  salaryProcessed?: boolean;  // ✅ Added
  salaryHold?: boolean;        // ✅ Added
  salaryHoldReason?: string;   // ✅ Added
  earnings: {
    basic: number;
    hra: number;
    conveyance: number;
    monthlyBonus: number;
    quarterlyBonus: number;
    specialAllowance: number;
  };
  deductions: {
    pf: number;
    esic: number;
    lop: number;
    advance?: number;
    salaryAdvance?: number;
    loan: number;
    tds: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  bankAccount?: string;
  pfNumber?: string;
  uanNumber?: string;
  esiNumber?: string;
  lopDays?: number;
  lopAmount?: number;
  standardDeductions?: number;
  workingDays?: number;
  absentDays?: number | string | null;
  totalDaysInMonth?: number;
}
export interface PayrollRecord {
  id: number;
  month: string;
  year: number;
  processedDate: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  status: PayrollStatus;
  approvedBy?: string;
  paidDate?: string;
}