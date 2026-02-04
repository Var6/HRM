import mongoose from 'mongoose';

const ExitInterviewSchema = new mongoose.Schema({
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
  resignationDate: {
    type: Date,
    required: true,
  },
  lastWorkingDay: {
    type: Date,
    required: true,
  },
  noticePeriod: {
    type: Number,
    default: 30,
  },
  reasonForLeaving: {
    type: String,
    enum: [
      'Better Opportunity',
      'Higher Salary',
      'Career Growth',
      'Work-Life Balance',
      'Relocation',
      'Health Issues',
      'Family Reasons',
      'Further Studies',
      'Retirement',
      'Other'
    ],
    required: true,
  },
  detailedReason: {
    type: String,
    required: true,
  },
  overallExperience: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  managerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  workEnvironmentRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  learningOpportunitiesRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  compensationRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  wouldRecommend: {
    type: Boolean,
    required: true,
  },
  suggestions: {
    type: String,
    default: '',
  },
  feedback: {
    type: String,
    default: '',
  },
  conductedBy: {
    type: String,
    required: true,
  },
  interviewDate: {
    type: Date,
    default: Date.now,
  },
  finalSettlement: {
    pendingSalary: {
      type: Number,
      default: 0,
    },
    leaveEncashment: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paidDate: {
      type: Date,
      default: null,
    },
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Settlement Pending', 'Closed'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

ExitInterviewSchema.index({ employeeId: 1, status: 1 });

export default mongoose.models.ExitInterview || mongoose.model('ExitInterview', ExitInterviewSchema);
