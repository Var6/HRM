// models/Performance.ts
import mongoose from 'mongoose';

const PerformanceSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  reviewer: { 
    type: String, 
    required: true 
  },
  comments: { 
    type: String, 
    required: true 
  },
  achievements: [String],
  improvementAreas: [String]
}, { timestamps: true });

export default mongoose.models.Performance || mongoose.model('Performance', PerformanceSchema);
