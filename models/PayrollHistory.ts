import mongoose from 'mongoose';

const PayrollHistorySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  
  // Salary structure snapshot at time of payroll
  salarySnapshot: {
    basic: Number,
    hra: Number,
    conveyance: Number,
    monthlyBonus: Number,
    quarterlyBonus: Number,
    specialAllowance: Number
  },
  
  grossSalary: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  
  earnings: {
    basic: Number,
    hra: Number,
    conveyance: Number,
    monthlyBonus: Number,
    quarterlyBonus: Number,
    specialAllowance: Number
  },
  
  deductions: {
    pf: Number,
    esic: Number,
    lop: Number,
    salaryAdvance: Number,
    loan: Number,
    tds: Number,
    manualDeduction: { type: Number, default: 0 }
  },
  
  // LOP Details
  lopDays: { type: Number, default: 0 },
  lopAmount: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  
  // Manual deductions
  manualDeductions: [{
    reason: String,
    amount: Number,
    remarks: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],
  totalManualDeductions: { type: Number, default: 0 },
  
  salaryProcessed: { type: Boolean, default: false },
  salaryHold: { type: Boolean, default: false },
  salaryHoldReason: String,
  processedDate: Date,
  status: { 
      type: String, 
      enum: ['draft', 'processing', 'approved', 'paid'],
      default: 'draft' 
    },
  processedBy: String
}, { timestamps: true });

export default mongoose.models.PayrollHistory || mongoose.model('PayrollHistory', PayrollHistorySchema);