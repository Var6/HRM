import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  description: String,
  isCompanyWide: { type: Boolean, default: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

HolidaySchema.index({ date: 1 });
HolidaySchema.index({ year: 1, month: 1 });

export default mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);
