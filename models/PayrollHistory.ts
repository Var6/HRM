import mongoose from "mongoose";

const PayrollHistorySchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  processedDate: { type: String, required: true },
  totalEmployees: { type: Number, required: true },
  totalGrossSalary: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  totalNetSalary: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'processing', 'approved', 'paid'],
    default: 'draft'
  },
  approvedBy: { type: String },
  paidDate: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.PayrollHistory || 
  mongoose.model("PayrollHistory", PayrollHistorySchema);