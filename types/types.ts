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
