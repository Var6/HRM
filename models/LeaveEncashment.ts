import mongoose from 'mongoose';

const LeaveEncashmentSchema = new mongoose.Schema({
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
  leaveType: {
    type: String,
    required: true,
  },
  leaveDays: {
    type: Number,
    required: true,
  },
  perDayRate: {
    type: Number,
    required: true,
  },
  encashmentAmount: {
    type: Number,
    required: true,
  },
  payrollMonth: {
    type: Date,
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
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

LeaveEncashmentSchema.index({ employeeId: 1, status: 1 });

export default mongoose.models.LeaveEncashment || mongoose.model('LeaveEncashment', LeaveEncashmentSchema);
