import mongoose from 'mongoose';

const ExpenseClaimSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  employeeCode: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  claimDate: {
    type: Date,
    required: true,
  },
  expenses: [{
    expenseType: {
      type: String,
      enum: ['Travel', 'Food', 'Accommodation', 'Medical', 'Communication', 'Office Supplies', 'Other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      default: null,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  },
  approvedBy: {
    type: String,
    default: null,
  },
  approvedDate: {
    type: Date,
    default: null,
  },
  paidDate: {
    type: Date,
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque'],
    default: 'Bank Transfer',
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

ExpenseClaimSchema.index({ employeeId: 1, approvalStatus: 1 });

export default mongoose.models.ExpenseClaim || mongoose.model('ExpenseClaim', ExpenseClaimSchema);
