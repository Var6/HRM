import mongoose from 'mongoose';

const PayrollHistorySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  
  // Salary fields
  grossSalary: { type: Number, required: true }, // After LOP deduction
  originalGrossSalary: { type: Number }, // Before LOP deduction
  totalDeductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  
  // Earnings breakdown
  earnings: {
    basic: Number,
    hra: Number,
    conveyance: Number,
    monthlyBonus: Number,
    quarterlyBonus: Number,
    specialAllowance: Number
  },
  
  // Deductions breakdown
  deductions: {
    pf: Number,
    esic: Number,
    lop: Number, // ✅ LOP amount
    salaryAdvance: Number,
    loan: Number,
    tds: Number
  },
  
  // ✅ LOP Details
  lopDays: { type: Number, default: 0 },
  lopAmount: { type: Number, default: 0 },
  
  // ✅ Attendance summary
  workingDays: Number,
  presentDays: Number,
  
  // Status fields
  salaryProcessed: { type: Boolean, default: false },
  salaryHold: { type: Boolean, default: false },
  salaryHoldReason: String,
  processedDate: Date,
  processedBy: String
}, { timestamps: true });

// Compound index for efficient queries
PayrollHistorySchema.index({ employeeId: 1, year: -1, month: -1 });

export default mongoose.models.PayrollHistory || mongoose.model('PayrollHistory', PayrollHistorySchema);