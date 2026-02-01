'use client';
import { pdf } from '@react-pdf/renderer';
import { PayslipDocument, numberToWordsIndian } from './PayslipDocuments';

// Type definition for employee salary data
export interface EmployeeSalaryData {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  fatherName: string;
  dateOfJoining: string;
  panNumber: string;
  uanNumber: string;
  esiNumber: string;
  photograph?: string | null;
  salaryProcessed?:boolean;
  aadharNumber: string;
  presentDays: number;
  totalDaysInMonth: number;
  modeOfPay: string;
  accountNumber: string;
  basic: number;
  salaryHold?:boolean;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  monthlyBonus: number;
  quarterlyBonus?: number;
  pf: number;
  esic: number;
  advance: number;
  loan?: number;
  lop?: number;
  tds?: number;
  remarks?: string;
}

/**
 * Calculate payslip data from employee salary data
 */
export const calculatePayslipData = (
  employee: EmployeeSalaryData,
  month: string,
  year: string
) => {
  // Calculate totals
  const totalEarnings = 
    employee.basic +
    employee.hra +
    employee.conveyance +
    employee.specialAllowance +
    employee.monthlyBonus +
    (employee.quarterlyBonus || 0);

  const totalDeductions = 
    employee.pf +
    employee.esic +
    employee.advance +
    (employee.loan || 0) +
    (employee.lop || 0) +
    (employee.tds || 0);

  const netPay = totalEarnings - totalDeductions;
  const netPayInWords = numberToWordsIndian(netPay);

  return {
    // Company Info
    companyName: 'Citizen Bachat Avam Sakh Swawlambi Sahkari Samiti Ltd.',
    companyAddress: 'Dr. Funny Gosh Lane, Anisabad, Patna-2',
    month,
    year,
    
    // Employee Info
    employeeId: employee.employeeId,
    employeeName: employee.employeeName,
    department: employee.department,
    designation: employee.designation,
    fatherName: employee.fatherName,
    dateOfJoining: employee.dateOfJoining,
    panNumber: employee.panNumber,

    uanNumber: employee.uanNumber,
    esiNumber: employee.esiNumber,
    aadharNumber: employee.aadharNumber,
    
    // Attendance
    presentDays: employee.presentDays,
    payDays: employee.presentDays, // Adjust if different
    
    // Bank Info
    modeOfPay: employee.modeOfPay,
    accountNumber: employee.accountNumber,
    
    // Salary Components
    earnings: {
      basic: employee.basic,
      hra: employee.hra,
      conveyance: employee.conveyance,
      specialAllowance: employee.specialAllowance,
      monthlyBonus: employee.monthlyBonus,
      quarterlyBonus: employee.quarterlyBonus,
    },
    
    deductions: {
      pf: employee.pf,
      esic: employee.esic,
      advance: employee.advance,
      loan: employee.loan,
      lop: employee.lop,
      tds: employee.tds,
    },
    
    // Calculated
    totalEarnings,
    totalDeductions,
    netPay,
    netPayInWords,
    
    remarks: employee.remarks,
  };
};

/**
 * Generate and download a single payslip PDF
 */
export const downloadPayslip = async (
  employee: EmployeeSalaryData,
  month: string,
  year: string
) => {
  try {
    const payslipData = calculatePayslipData(employee, month, year);
    const blob = await pdf(<PayslipDocument data={payslipData} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${employee.employeeId}_${month}_${year}.pdf`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Payslip downloaded successfully' };
  } catch (error) {
    console.error('Error generating payslip:', error);
    return { success: false, message: 'Failed to generate payslip' };
  }
};

/**
 * Generate payslip blob for preview or email
 */
export const generatePayslipBlob = async (
  employee: EmployeeSalaryData,
  month: string,
  year: string
): Promise<Blob> => {
  const payslipData = calculatePayslipData(employee, month, year);
  return await pdf(<PayslipDocument data={payslipData} />).toBlob();
};

/**
 * Generate payslip URL for preview
 */
export const generatePayslipURL = async (
  employee: EmployeeSalaryData,
  month: string,
  year: string
): Promise<string> => {
  const blob = await generatePayslipBlob(employee, month, year);
  return URL.createObjectURL(blob);
};

/**
 * Download multiple payslips as a ZIP file
 * Requires JSZip library: npm install jszip
 */
export const downloadBulkPayslips = async (
  employees: EmployeeSalaryData[],
  month: string,
  year: string
) => {
  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Generate all payslips
    for (const employee of employees) {
      const payslipData = calculatePayslipData(employee, month, year);
      const blob = await pdf(<PayslipDocument data={payslipData} />).toBlob();
      zip.file(`${employee.employeeId}_${employee.employeeName}_${month}_${year}.pdf`, blob);
    }
    
    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download ZIP
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslips_${month}_${year}.zip`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return { success: true, message: `${employees.length} payslips downloaded successfully` };
  } catch (error) {
    console.error('Error generating bulk payslips:', error);
    return { success: false, message: 'Failed to generate payslips' };
  }
};

/**
 * Send payslip via email (backend integration required)
 */
export const emailPayslip = async (
  employee: EmployeeSalaryData,
  month: string,
  year: string,
  emailAddress: string
) => {
  try {
    const blob = await generatePayslipBlob(employee, month, year);
    
    // Convert blob to base64 for API
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:application/pdf;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    const base64PDF = await base64Promise;
    
    // Call your backend API to send email
    // This is a placeholder - implement according to your backend
    const response = await fetch('/api/send-payslip-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailAddress,
        employeeName: employee.employeeName,
        month,
        year,
        pdfBase64: base64PDF,
      }),
    });
    
    if (response.ok) {
      return { success: true, message: 'Payslip sent successfully' };
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending payslip:', error);
    return { success: false, message: 'Failed to send payslip' };
  }
};

