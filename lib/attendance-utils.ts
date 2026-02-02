// lib/attendance-utils.ts

/**
 * Calculate total working days in a month (excluding Tuesdays)
 * @param month - Month (0-11)
 * @param year - Year
 * @returns Number of working days
 */
export function getWorkingDaysInMonth(month: number, year: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    // Tuesday is 2 (0=Sunday, 1=Monday, 2=Tuesday, etc.)
    // Saturday=6, Sunday=0 are working days
    if (dayOfWeek !== 2) {
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
 * Calculate LOP (Loss of Pay) details for an employee
 * @param attendanceRecords - Employee's attendance records for the month
 * @param month - Month (0-11)
 * @param year - Year
 * @param casualLeavesTaken - Number of casual leaves taken
 * @param earnedLeavesTaken - Number of earned leaves taken
 * @param monthlyCredit - Monthly leave credits
 * @returns LOP days
 */
export function calculateLOP(
  attendanceRecords: any[],
  month: number,
  year: number,
  casualLeavesTaken: number,
  earnedLeavesTaken: number,
  monthlyCredit: { casualLeave: number; earnedLeave: number }
): number {
  // Total leaves allowed per month (CL + EL)
  const totalLeavesAllowed = monthlyCredit.casualLeave + monthlyCredit.earnedLeave;
  
  // Total leaves taken (excluding sick and extraordinary which don't count towards LOP)
  const totalLeavesTaken = casualLeavesTaken + earnedLeavesTaken;
  
  // LOP days = leaves taken beyond allowed limit
  const lopDays = Math.max(0, totalLeavesTaken - totalLeavesAllowed);
  
  return lopDays;
}

/**
 * Calculate LOP amount to deduct from salary
 * @param grossSalary - Employee's gross salary
 * @param lopDays - Number of LOP days
 * @param month - Month (0-11)
 * @param year - Year
 * @returns LOP amount to deduct
 */
export function calculateLOPAmount(
  grossSalary: number,
  lopDays: number,
  month: number,
  year: number
): number {
  if (lopDays <= 0) return 0;
  
  // Get total working days in the month (excluding Tuesdays)
  const workingDays = getWorkingDaysInMonth(month, year);
  
  // Per day salary = Gross Salary / Working Days
  const perDaySalary = grossSalary / workingDays;
  
  // LOP Amount = Per Day Salary × LOP Days
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