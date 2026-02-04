import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['birthday', 'retirement', 'payslip', 'attendance', 'missing_field', 'emergency_contact'],
      required: true 
    },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: String,
    title: String,
    message: String,
    read: { type: Boolean, default: false },
    dueDate: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.Notification || 
  mongoose.model("Notification", NotificationSchema);
