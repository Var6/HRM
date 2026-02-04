import mongoose from 'mongoose';

const AttendanceRequestSchema = new mongoose.Schema({
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
  attendanceDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  supportingDocument: {
    type: String,
    default: null,
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
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
  rejectionReason: {
    type: String,
    default: null,
  },
  workingHours: {
    type: Number,
    default: 8,
  },
}, {
  timestamps: true,
});

AttendanceRequestSchema.index({ employeeId: 1, approvalStatus: 1 });

export default mongoose.models.AttendanceRequest || mongoose.model('AttendanceRequest', AttendanceRequestSchema);
