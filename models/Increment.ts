// models/Increment.ts
import mongoose from 'mongoose';

const IncrementSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  type: { 
    type: String, 
    enum: ['hike', 'increment', 'bonus', 'promotion'], 
    required: true 
  },
  previousSalary: { 
    type: Number, 
    required: true 
  },
  newSalary: { 
    type: Number, 
    required: true 
  },
  percentage: { 
    type: Number, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  approvedBy: { 
    type: String, 
    required: true 
  },
  effectiveFrom: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.models.Increment || mongoose.model('Increment', IncrementSchema);
