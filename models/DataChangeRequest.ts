import mongoose, { Schema, Document } from 'mongoose';

export interface IDataChangeRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeCode: string;
  employeeName: string;
  requestType: 'personal' | 'contact' | 'emergency' | 'bank' | 'other';
  fieldName: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  hrRemarks?: string;
  rejectionReason?: string;
  requestedOn: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedOn?: Date;
  department?: string;
}

const DataChangeRequestSchema: Schema = new Schema({
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
  requestType: {
    type: String,
    enum: ['personal', 'contact', 'emergency', 'bank', 'other'],
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  currentValue: {
    type: String,
    required: true
  },
  requestedValue: {
    type: String,
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
  requestedOn: {
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

export default mongoose.models.DataChangeRequest || mongoose.model<IDataChangeRequest>('DataChangeRequest', DataChangeRequestSchema);
