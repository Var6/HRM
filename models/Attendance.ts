import mongoose from "mongoose";

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'leave', 'halfDay', 'weekend', 'holiday'],
    required: true 
  },
  leaveType: {
    type: String,
    enum: ['casual', 'earned', 'sick', 'halfDay', 'extraordinary', null],
    default: null
  },
  checkIn: String,
  checkOut: String,
  remarks: String
});

const MonthlyAttendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    required: true 
  },
  month: { type: Number, required: true, min: 0, max: 11 }, // 0-11 (Jan-Dec)
  year: { type: Number, required: true },
  
  records: [AttendanceRecordSchema],
  
  summary: {
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    totalLeaves: { type: Number, default: 0 },
    totalHalfDays: { type: Number, default: 0 },
    casualLeavesTaken: { type: Number, default: 0 },
    earnedLeavesTaken: { type: Number, default: 0 },
    sickLeavesTaken: { type: Number, default: 0 },
    extraordinaryLeavesTaken: { type: Number, default: 0 }
  },
  
  leaveBalance: {
    casualLeave: { type: Number, default: 0 },
    earnedLeave: { type: Number, default: 0 },
    carriedForward: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Compound index for efficient queries
MonthlyAttendanceSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.models.MonthlyAttendance || 
  mongoose.model("MonthlyAttendance", MonthlyAttendanceSchema);