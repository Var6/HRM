import mongoose from 'mongoose';

const EmployeeCheckinSchema = new mongoose.Schema({
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
  checkInTime: {
    type: Date,
    required: true,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  deviceInfo: {
    type: String,
    default: '',
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Checked In', 'Checked Out'],
    default: 'Checked In',
  },
  notes: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  shift: {
    type: String,
    default: 'Regular',
  },
}, {
  timestamps: true,
});

// Index for faster queries
EmployeeCheckinSchema.index({ employeeId: 1, date: -1 });

export default mongoose.models.EmployeeCheckin || mongoose.model('EmployeeCheckin', EmployeeCheckinSchema);
