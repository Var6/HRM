// lib/attendance-utils.ts

/**
 * Get total calendar days in a month
 * @param month - Month (0-11)
 * @param year - Year
 * @returns Total days in the month
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calculate total working days in a month (excluding Tuesdays and holidays)
 * @param month - Month (0-11)
 * @param year - Year
 * @param holidays - Array of holiday dates
 * @returns Number of working days
 */
export function getWorkingDaysInMonth(month: number, year: number, holidays: Date[] = []): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  
  const holidaySet = new Set(
    holidays.map(h => {
      const d = new Date(h);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const dateStr = `${year}-${month}-${day}`;
    
    // Tuesday is 2, exclude holidays
    if (dayOfWeek !== 2 && !holidaySet.has(dateStr)) {
      workingDays++;
    }
  }

  return workingDays;
}

/**
 * Check if a specific date is a Tuesday (holiday)
 * @param date - Date to check
 * @returns true if Tuesday, false otherwise
 */
export function isTuesday(date: Date): boolean {
  return date.getDay() === 2;
}

/**
 * Get all Tuesday dates in a month
 * @param month - Month (0-11)
 * @param year - Year
 * @returns Array of Tuesday dates
 */
export function getTuesdaysInMonth(month: number, year: number): Date[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tuesdays: Date[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date.getDay() === 2) {
      tuesdays.push(date);
    }
  }

  return tuesdays;
}

/**
 * Calculate LOP (Loss of Pay) details - CORRECTED LOGIC
 * If absent/on leave for more than 2.25 days, deduct salary for excess days
 * @param attendanceRecords - Employee's attendance records for the month
 * @param month - Month (0-11)
 * @param year - Year
 * @param holidays - Array of holiday dates
 * @returns LOP days
 */
export function calculateLOP(
  attendanceRecords: any[],
  month: number,
  year: number,
  casualLeavesTaken: number,
  earnedLeavesTaken: number,
  monthlyCredit: { casualLeave: number; earnedLeave: number },
  holidays: Date[] = []
): number {
  // Count total absent/onLeave days
  const absentDays = attendanceRecords.filter(r => 
    r.status === 'onLeave' || r.status === 'absent'
  ).length;
  
  // If absent more than 2.25 days, calculate LOP for excess days
  const excessAbsentDays = Math.max(0, absentDays - 2.25);
  
  return excessAbsentDays;
}

/**
 * Calculate LOP amount to deduct from salary - CORRECTED LOGIC
 * LOP = (Days absent - 2.25) × (Monthly Salary / Days in Month)
 * @param grossSalary - Employee's gross salary
 * @param lopDays - Number of LOP days
 * @param month - Month (0-11)
 * @param year - Year
 * @param holidays - Array of holiday dates
 * @returns LOP amount to deduct
 */
export function calculateLOPAmount(
  grossSalary: number,
  lopDays: number,
  month: number,
  year: number,
  holidays: Date[] = []
): number {
  if (lopDays <= 0) return 0;
  
  // Get total days in month (all days including weekends)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Per day salary = Gross Salary / Total Days in Month
  const perDaySalary = grossSalary / daysInMonth;
  
  // LOP Amount = Per Day Salary × Excess Absent Days
  const lopAmount = perDaySalary * lopDays;
  
  return Math.round(lopAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Get attendance summary for display
 * @param attendanceRecords - Attendance records
 * @param month - Month (0-11)
 * @param year - Year
 * @returns Summary object
 */
export function getAttendanceSummary(
  attendanceRecords: any[],
  month: number,
  year: number
) {
  const workingDays = getWorkingDaysInMonth(month, year);
  const tuesdays = getTuesdaysInMonth(month, year);
  
  let totalLeaves = 0;
  let totalAbsent = 0;
  let casualLeavesTaken = 0;
  let earnedLeavesTaken = 0;
  let sickLeavesTaken = 0;
  let extraordinaryLeavesTaken = 0;
  let halfDays = 0;

  attendanceRecords.forEach((record: any) => {
    if (record.status === 'onLeave') {
      totalAbsent++;
    } else if (record.status === 'leave') {
      totalLeaves++;
      if (record.leaveType === 'casual') casualLeavesTaken++;
      if (record.leaveType === 'earned') earnedLeavesTaken++;
      if (record.leaveType === 'sick') sickLeavesTaken++;
      if (record.leaveType === 'extraordinary') extraordinaryLeavesTaken++;
    } else if (record.status === 'halfDay') {
      halfDays++;
      totalLeaves += 0.5;
      if (record.leaveType === 'casual') casualLeavesTaken += 0.5;
      if (record.leaveType === 'earned') earnedLeavesTaken += 0.5;
    }
  });

  // Present days = Working days - (absences recorded in DB)
  const recordedAbsences = attendanceRecords.filter(r => 
    r.status === 'onLeave' || r.status === 'leave' || r.status === 'halfDay'
  ).length;
  
  const totalPresent = workingDays - recordedAbsences;

  return {
    workingDays,
    totalPresent,
    totalAbsent,
    totalLeaves,
    halfDays,
    casualLeavesTaken,
    earnedLeavesTaken,
    sickLeavesTaken,
    extraordinaryLeavesTaken,
    tuesdays: tuesdays.length
  };
}