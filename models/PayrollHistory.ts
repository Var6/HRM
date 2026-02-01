import mongoose from 'mongoose';

const PayrollHistorySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
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
    tds: Number
  },
  salaryProcessed: { type: Boolean, default: false },
  salaryHold: { type: Boolean, default: false },
  salaryHoldReason: String,
  processedDate: Date,
  processedBy: String
}, { timestamps: true });

export default mongoose.models.PayrollHistory || mongoose.model('PayrollHistory', PayrollHistorySchema);