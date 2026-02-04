import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeCode: string;
  employeeName: string;
  leaveType: 'casual' | 'earned' | 'sick' | 'maternity' | 'paternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  hrRemarks?: string;
  rejectionReason?: string;
  appliedOn: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedOn?: Date;
  department?: string;
}

const LeaveRequestSchema: Schema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeCode: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'earned', 'sick', 'maternity', 'paternity', 'unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  hrRemarks: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  appliedOn: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reviewedOn: {
    type: Date
  },
  department: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
