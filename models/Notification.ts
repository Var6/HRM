import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'birthday', 'retirement', 'payslip', 'attendance',
        'missing_field', 'emergency_contact', 'leave_request',
        'data_change_request', 'employee_created', 'employee_updated', 'task_complete'
      ],
      required: true
    },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: String,
    title: String,
    message: String,
    read: { type: Boolean, default: false },
    dueDate: Date,
    // Birthday/time-bound notifications expire automatically after this date
    expiresAt: { type: Date, default: null, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.Notification || 
  mongoose.model("Notification", NotificationSchema);
