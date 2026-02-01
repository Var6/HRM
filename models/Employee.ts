import mongoose from "mongoose";

const WorkExperienceSchema = new mongoose.Schema({
  organization: String,
  designation: String,
  periodOfStay: String,
});

const SalarySchema = new mongoose.Schema({
  earnings: mongoose.Schema.Types.Mixed,
  deductions: mongoose.Schema.Types.Mixed,
  salaryProcessed: { 
  type: Boolean, 
  default: false 
},
salaryProcessedDate: String,
salaryHold: { 
  type: Boolean, 
  default: false 
},
salaryHoldReason: String,
});

const LeaveSchema = new mongoose.Schema({
  casualLeave: Number,
  earnedLeave: Number,
  halfDayLeave: Number,
  sickLeave: Number,
  extraordinaryLeave: Number,
});

const EmployeeSchema = new mongoose.Schema(
  {
    // Personal
    name: { type: String, required: true },
    photograph: String,
    dateOfBirth: String,
    fatherName: String,
    motherName: String,
    spouseName: String,
    category: String,
    fatherOccupation: String,
    permanentAddress: String,
    correspondenceAddress: String,
    EcontactNo: String,
    bloodGroup: String,
    identificationMark: String,
    panCardNo: String,
    aadharCardNo: String,
    drivingLicenseNo: String,
    maritalStatus: String,
    educationQualification: String,

    // Experience
    workExperience: [WorkExperienceSchema],

    // Employment
    dateOfInterview: String,
    dateOfJoining: String,
    employeeCode: { type: String, unique: true },
    department: String,
    designation: String,
    branchName: String,
    modeOfPayment: String,
    bankAccountNo: String,
    pfNo: String,
    uanNo: String,
    esiNo: String,
    exitDate: String,

    // Contact
    email: String,
    mobileNumber: String,

    // Assets
    emailProvided: String,
    mobileNumberProvided: String,
    idCardProvided: Boolean,
    diaryProvided: Boolean,
    visitingCardProvided: Boolean,

    // Salary
    salary: SalarySchema,

    // Leaves
    leaves: LeaveSchema,

    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
