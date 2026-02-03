import * as XLSX from 'xlsx';
import { EmployeeSalaryData } from '@/lib/payslip-utils';

/**
 * Export monthly payroll data to Excel file
 * Includes all employees with salary breakdown for given month
 */
export const exportPayrollToExcel = (
  employees: EmployeeSalaryData[],
  month: string,
  year: string
) => {
  const data = employees.map((emp) => ({
    'Employee ID': emp.employeeId,
    'Employee Name': emp.employeeName,
    'Designation': emp.designation,
    'Department': emp.department,
    'Basic': emp.basic || 0,
    'HRA': emp.hra || 0,
    'Conveyance': emp.conveyance || 0,
    'Monthly Bonus': emp.monthlyBonus || 0,
    'Quarterly Bonus': emp.quarterlyBonus || 0,
    'Special Allowance': emp.specialAllowance || 0,
    'Gross Salary': (emp.basic || 0) + (emp.hra || 0) + (emp.conveyance || 0) + (emp.monthlyBonus || 0) + (emp.quarterlyBonus || 0) || 0,
    'PF': emp.pf || 0,
    'ESIC': emp.esic || 0,
    'Advance': emp.advance || 0,
    'Loan': emp.loan || 0,
    'LOP': emp.lop || 0,
    'TDS': emp.tds || 0,
    'Total Deductions': (emp.pf || 0) + (emp.esic || 0) + (emp.advance || 0) + (emp.loan || 0) + (emp.lop || 0) + (emp.tds || 0),
    'Net Salary': (emp.basic || 0) + (emp.hra || 0) + (emp.conveyance || 0) + (emp.monthlyBonus || 0) - ((emp.pf || 0) + (emp.esic || 0) + (emp.advance || 0) + (emp.loan || 0) + (emp.lop || 0) + (emp.tds || 0)),
    'Bank Account': emp.accountNumber,
    'Present Days': emp.presentDays,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const maxWidth = 20;
  const columnWidths = Array(Object.keys(data[0] || {}).length).fill(maxWidth);
  worksheet['!cols'] = columnWidths.map(width => ({ wch: width }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Payroll-${month}-${year}`);

  // Save file
  XLSX.writeFile(workbook, `Payroll_${month}_${year}.xlsx`);
};

/**
 * Export individual payslip to Excel
 * Creates a detailed payslip with all components
 */
export const exportPayslipToExcel = (
  employee: EmployeeSalaryData,
  month: string,
  year: string
) => {
  const grossSalary = (employee.basic || 0) + (employee.hra || 0) + (employee.conveyance || 0) + 
                      (employee.monthlyBonus || 0) + (employee.quarterlyBonus || 0);
  const totalDeductions = (employee.pf || 0) + (employee.esic || 0) + (employee.advance || 0) + 
                         (employee.loan || 0) + (employee.lop || 0) + (employee.tds || 0);
  const netSalary = grossSalary - totalDeductions;

  const payslipData = [
    { Field: 'Payslip For', Value: `${month} ${year}` },
    { Field: '', Value: '' },
    { Field: 'EMPLOYEE DETAILS', Value: '' },
    { Field: 'Employee ID', Value: employee.employeeId },
    { Field: 'Employee Name', Value: employee.employeeName },
    { Field: 'Designation', Value: employee.designation },
    { Field: 'Department', Value: employee.department },
    { Field: 'Bank Account', Value: employee.accountNumber },
    { Field: 'PAN Number', Value: employee.panNumber },
    { Field: 'UAN Number', Value: employee.uanNumber },
    { Field: 'ESI Number', Value: employee.esiNumber },
    { Field: '', Value: '' },
    { Field: 'EARNINGS', Value: '' },
    { Field: 'Basic Salary', Value: employee.basic || 0 },
    { Field: 'HRA', Value: employee.hra || 0 },
    { Field: 'Conveyance', Value: employee.conveyance || 0 },
    { Field: 'Monthly Bonus', Value: employee.monthlyBonus || 0 },
    { Field: 'Quarterly Bonus', Value: employee.quarterlyBonus || 0 },
    { Field: 'Gross Salary', Value: grossSalary },
    { Field: '', Value: '' },
    { Field: 'DEDUCTIONS', Value: '' },
    { Field: 'Provident Fund (PF)', Value: employee.pf || 0 },
    { Field: 'ESIC', Value: employee.esic || 0 },
    { Field: 'Salary Advance', Value: employee.advance || 0 },
    { Field: 'Loan', Value: employee.loan || 0 },
    { Field: 'LOP', Value: employee.lop || 0 },
    { Field: 'TDS', Value: employee.tds || 0 },
    { Field: 'Total Deductions', Value: totalDeductions },
    { Field: '', Value: '' },
    { Field: 'NET SALARY', Value: netSalary },
  ];

  const worksheet = XLSX.utils.json_to_sheet(payslipData);
  worksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslip');
  
  XLSX.writeFile(workbook, `Payslip_${employee.employeeName}_${month}_${year}.xlsx`);
};

/**
 * Export attendance-based payroll report
 * Shows LOP, working days, paid days, etc.
 */
export const exportAttendancePayrollReport = (
  employees: EmployeeSalaryData[],
  month: string,
  year: string,
  attendanceData?: any[]
) => {
  const data = employees.map((emp) => ({
    'Employee ID': emp.employeeId,
    'Employee Name': emp.employeeName,
    'Designation': emp.designation,
    'Gross Salary': (emp.basic || 0) + (emp.hra || 0) + (emp.conveyance || 0),
    'LOP Days': emp.lop ? 'Yes' : 'No',
    'Total Deductions': (emp.pf || 0) + (emp.esic || 0) + (emp.lop || 0),
    'Net Salary': (emp.basic || 0) + (emp.hra || 0) + (emp.conveyance || 0) - ((emp.pf || 0) + (emp.esic || 0) + (emp.lop || 0)),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = Array(7).fill({ wch: 20 });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance-Payroll-${month}`);

  XLSX.writeFile(workbook, `Attendance_Payroll_Report_${month}_${year}.xlsx`);
};

/**
 * Export salary register report
 * Suitable for statutory compliance and audits
 */
export const exportSalaryRegister = (
  employees: EmployeeSalaryData[],
  month: string,
  year: string
) => {
  const data = employees.map((emp) => {
    const grossSalary = (emp.basic || 0) + (emp.hra || 0) + (emp.conveyance || 0) + (emp.monthlyBonus || 0);
    const totalDeductions = (emp.pf || 0) + (emp.esic || 0) + (emp.tds || 0) + (emp.lop || 0);
    return {
      'Sl. No': emp.employeeId,
      'Name': emp.employeeName,
      'Designation': emp.designation,
      'Department': emp.department,
      'Gross Salary': grossSalary,
      'Basic': emp.basic || 0,
      'PF': emp.pf || 0,
      'ESIC': emp.esic || 0,
      'IT/TDS': emp.tds || 0,
      'LOP': emp.lop || 0,
      'Total Ded.': totalDeductions,
      'Net Pay': grossSalary - totalDeductions,
      'Bank A/C': emp.accountNumber,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = Array(13).fill({ wch: 15 });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Register');

  XLSX.writeFile(workbook, `Salary_Register_${month}_${year}.xlsx`);
};

/**
 * Generate payslip HTML for email or printing
 * Can be used to create PDF or send as HTML email
 */
export const generatePayslipHTML = (
  employee: EmployeeSalaryData,
  month: string,
  year: string,
  companyName?: string
): string => {
  const grossSalary = (employee.basic || 0) + (employee.hra || 0) + (employee.conveyance || 0) + 
                      (employee.monthlyBonus || 0) + (employee.quarterlyBonus || 0);
  const totalDeductions = (employee.pf || 0) + (employee.esic || 0) + (employee.advance || 0) + 
                         (employee.loan || 0) + (employee.lop || 0) + (employee.tds || 0);
  const netSalary = grossSalary - totalDeductions;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .payslip {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #1e40af;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          color: #1e40af;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .month-year {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1e40af;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          background-color: #f0f4ff;
          padding: 8px 12px;
          margin-bottom: 12px;
          border-left: 4px solid #1e40af;
        }
        .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .row.total {
          font-weight: bold;
          background-color: #f9fafb;
          padding: 12px 0;
          border-bottom: 2px solid #1e40af;
          border-top: 2px solid #1e40af;
        }
        .label {
          flex: 1;
          color: #666;
        }
        .value {
          text-align: right;
          flex: 0 0 120px;
          font-weight: 500;
        }
        .employee-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
        }
        .info-item {
          font-size: 13px;
        }
        .info-label {
          color: #999;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .info-value {
          color: #333;
          font-weight: 500;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="payslip">
        <div class="header">
          <h1>${companyName || 'Company Name'}</h1>
          <p>Payslip</p>
        </div>

        <div class="month-year">
          ${month} ${year}
        </div>

        <div class="employee-info">
          <div class="info-item">
            <div class="info-label">Employee ID</div>
            <div class="info-value">${employee.employeeId}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Designation</div>
            <div class="info-value">${employee.designation}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Employee Name</div>
            <div class="info-value">${employee.employeeName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Department</div>
            <div class="info-value">${employee.department}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">EARNINGS</div>
          <div class="row">
            <span class="label">Basic Salary</span>
            <span class="value">₹${(employee.basic || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="row">
            <span class="label">HRA</span>
            <span class="value">₹${(employee.hra || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="row">
            <span class="label">Conveyance</span>
            <span class="value">₹${(employee.conveyance || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="row">
            <span class="label">Monthly Bonus</span>
            <span class="value">₹${(employee.monthlyBonus || 0).toLocaleString('en-IN')}</span>
          </div>
          ${employee.quarterlyBonus ? `
          <div class="row">
            <span class="label">Quarterly Bonus</span>
            <span class="value">₹${(employee.quarterlyBonus || 0).toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="row total">
            <span class="label">Gross Salary</span>
            <span class="value">₹${grossSalary.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">DEDUCTIONS</div>
          ${employee.lop ? `
            <div class="row">
              <span class="label">Loss of Pay (LOP)</span>
              <span class="value">₹${(employee.lop || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${employee.pf ? `
            <div class="row">
              <span class="label">Provident Fund (PF)</span>
              <span class="value">₹${(employee.pf || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${employee.esic ? `
            <div class="row">
              <span class="label">ESIC</span>
              <span class="value">₹${(employee.esic || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${employee.advance ? `
            <div class="row">
              <span class="label">Salary Advance</span>
              <span class="value">₹${(employee.advance || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${employee.loan ? `
            <div class="row">
              <span class="label">Loan</span>
              <span class="value">₹${(employee.loan || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${employee.tds ? `
            <div class="row">
              <span class="label">Income Tax / TDS</span>
              <span class="value">₹${(employee.tds || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div class="row total">
            <span class="label">Total Deductions</span>
            <span class="value">₹${totalDeductions.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="section">
          <div class="row total" style="font-size: 16px; padding: 15px 0;">
            <span class="label">NET SALARY</span>
            <span class="value">₹${netSalary.toLocaleString('en-IN')}</span>
          </div>
          <div class="row" style="border-bottom: none; margin-top: 10px;">
            <span class="label">Bank Account</span>
            <span class="value">${employee.accountNumber}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>For any discrepancies, please contact the HR department.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Format currency to INR format
 */
export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
