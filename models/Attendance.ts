import mongoose from "mongoose";

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['onLeave', 'leave', 'halfDay', 'weekend', 'holiday'],  // ✅ Removed 'present' - we only store exceptions
    required: true 
  },
  leaveType: {
    type: String,
    enum: ['casual', 'earned', 'sick', 'halfDay', 'extraordinary', null],
    default: null
  },
  leaveReason: String,
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
  month: { type: Number, required: true, min: 0, max: 11 },
  year: { type: Number, required: true },
  
  records: [AttendanceRecordSchema], // ✅ Only non-present days
  
  summary: {
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },  // LOP days
    totalLeaves: { type: Number, default: 0 },
    totalHalfDays: { type: Number, default: 0 },
    casualLeavesTaken: { type: Number, default: 0 },
    earnedLeavesTaken: { type: Number, default: 0 },
    sickLeavesTaken: { type: Number, default: 0 },
    extraordinaryLeavesTaken: { type: Number, default: 0 }
  },
  
  // ✅ NEW: Monthly Credits (auto-credited on 1st of month)
  monthlyCredit: {
    casualLeave: { type: Number, default: 1 },      // 1 CL per month (12/year)
    earnedLeave: { type: Number, default: 1.25 }    // 1.25 EL per month (15/year)
  },
  
  // ✅ Running balance (carries forward)
  leaveBalance: {
    casualLeave: { type: Number, default: 0 },
    earnedLeave: { type: Number, default: 0 },
    carriedForward: { type: Number, default: 0 }
  },
  
  // ✅ NEW: LOP calculation
  lop: {
    days: { type: Number, default: 0 },           // Total LOP days
    amount: { type: Number, default: 0 }          // Amount to deduct from salary
  }
  
}, { timestamps: true });

MonthlyAttendanceSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.models.MonthlyAttendance || 
mongoose.model("MonthlyAttendance", MonthlyAttendanceSchema);