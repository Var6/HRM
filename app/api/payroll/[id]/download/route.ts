import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PayrollHistory from '@/models/PayrollHistory';
import Employee from '@/models/Employee';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Fetch payroll record
    const payroll = await PayrollHistory.findById(params.id).lean();
    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    // Fetch employee details
    const employee = await Employee.findById(payroll.employeeId).lean();
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Generate payslip HTML
    const payslipHTML = generatePayslipHTML(employee, payroll);

    // Return HTML as response (browser will download as HTML, user can print to PDF)
    return new NextResponse(payslipHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Payslip-${employee.employeeCode}-${payroll.month}-${payroll.year}.html"`,
      },
    });
  } catch (error) {
    console.error('Error downloading payslip:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function generatePayslipHTML(employee: any, payroll: any) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const earnings = payroll.earnings || {};
  const deductions = payroll.deductionsBreakdown || {};

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payslip - ${employee.employeeCode}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          color: #333;
          background: #f5f5f5;
        }
        .container {
          width: 100%;
          max-width: 900px;
          margin: 20px auto;
          background: white;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .company-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        .payslip-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
        }
        .period {
          font-size: 14px;
          color: #666;
          font-weight: bold;
        }
        .employee-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 5px;
        }
        .info-block {
          font-size: 13px;
          line-height: 1.8;
        }
        .info-label {
          font-weight: bold;
          color: #1e40af;
        }
        .info-value {
          color: #333;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          background: #1e40af;
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 15px;
          border-radius: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 13px;
        }
        th {
          background: #e8eef7;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 2px solid #1e40af;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #ddd;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .total-row {
          background: #f0f4ff;
          font-weight: bold;
        }
        .total-row td {
          padding: 12px 10px;
          border-bottom: 2px solid #1e40af;
        }
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-box {
          padding: 15px;
          border: 2px solid #1e40af;
          border-radius: 5px;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .summary-amount {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
        }
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 20px;
          margin-top: 30px;
          text-align: center;
          font-size: 11px;
          color: #666;
        }
        .status {
          padding: 10px 15px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        .status.processed {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }
        .status.pending {
          background: #fef08a;
          color: #854d0e;
          border: 1px solid #facc15;
        }
        .status.hold {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        @media print {
          body {
            background: white;
          }
          .container {
            margin: 0;
            border: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">CSCC Society</div>
          <div class="company-info">Employee Payslip | Human Resources Management System</div>
          <div class="payslip-title">SALARY SLIP</div>
          <div class="period">${months[parseInt(payroll.month)]} ${payroll.year}</div>
        </div>

        <!-- Status -->
        <div class="status ${payroll.salaryProcessed ? 'processed' : payroll.salaryHold ? 'hold' : 'pending'}">
          ${payroll.salaryProcessed ? '✓ PROCESSED' : payroll.salaryHold ? '✕ ON HOLD' : '⏳ PENDING'}
          ${payroll.salaryHold && payroll.salaryHoldReason ? `- ${payroll.salaryHoldReason}` : ''}
        </div>

        <!-- Employee Information -->
        <div class="employee-info">
          <div class="info-block">
            <div><span class="info-label">Employee Code:</span> <span class="info-value">${employee.employeeCode}</span></div>
            <div><span class="info-label">Employee Name:</span> <span class="info-value">${employee.name}</span></div>
            <div><span class="info-label">Department:</span> <span class="info-value">${employee.department || 'N/A'}</span></div>
            <div><span class="info-label">Designation:</span> <span class="info-value">${employee.designation || 'N/A'}</span></div>
          </div>
          <div class="info-block">
            <div><span class="info-label">Email:</span> <span class="info-value">${employee.email || 'N/A'}</span></div>
            <div><span class="info-label">PF Number:</span> <span class="info-value">${employee.pfNo || 'N/A'}</span></div>
            <div><span class="info-label">ESI Number:</span> <span class="info-value">${employee.esiNo || 'N/A'}</span></div>
            <div><span class="info-label">UAN:</span> <span class="info-value">${employee.uanNo || 'N/A'}</span></div>
          </div>
        </div>

        <!-- Earnings Section -->
        <div class="section">
          <div class="section-title">EARNINGS</div>
          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td class="amount">${formatCurrency(earnings.basic || 0)}</td>
              </tr>
              <tr>
                <td>House Rent Allowance (HRA)</td>
                <td class="amount">${formatCurrency(earnings.hra || 0)}</td>
              </tr>
              <tr>
                <td>Conveyance Allowance</td>
                <td class="amount">${formatCurrency(earnings.conveyance || 0)}</td>
              </tr>
              <tr>
                <td>Monthly Bonus</td>
                <td class="amount">${formatCurrency(earnings.monthlyBonus || 0)}</td>
              </tr>
              <tr>
                <td>Quarterly Bonus</td>
                <td class="amount">${formatCurrency(earnings.quarterlyBonus || 0)}</td>
              </tr>
              <tr>
                <td>Special Allowance</td>
                <td class="amount">${formatCurrency(earnings.specialAllowance || 0)}</td>
              </tr>
              <tr class="total-row">
                <td>GROSS SALARY</td>
                <td class="amount">${formatCurrency(payroll.grossSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Deductions Section -->
        <div class="section">
          <div class="section-title">DEDUCTIONS</div>
          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Provident Fund (PF)</td>
                <td class="amount">${formatCurrency(deductions.pf || 0)}</td>
              </tr>
              <tr>
                <td>Employee State Insurance (ESI)</td>
                <td class="amount">${formatCurrency(deductions.esic || 0)}</td>
              </tr>
              <tr>
                <td>Income Tax (TDS)</td>
                <td class="amount">${formatCurrency(deductions.tds || 0)}</td>
              </tr>
              <tr>
                <td>Salary Advance</td>
                <td class="amount">${formatCurrency(deductions.advance || 0)}</td>
              </tr>
              <tr>
                <td>Loan Deduction</td>
                <td class="amount">${formatCurrency(deductions.loan || 0)}</td>
              </tr>
              <tr>
                <td>Loss of Pay (LOP)</td>
                <td class="amount">${formatCurrency(deductions.lop || 0)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL DEDUCTIONS</td>
                <td class="amount">${formatCurrency(payroll.deductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="summary">
          <div class="summary-box">
            <div class="summary-label">GROSS SALARY</div>
            <div class="summary-amount">${formatCurrency(payroll.grossSalary)}</div>
          </div>
          <div class="summary-box">
            <div class="summary-label">NET SALARY (Payable)</div>
            <div class="summary-amount">${formatCurrency(payroll.netSalary)}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>This is a system-generated payslip. No signature is required.</p>
          <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
          <p>For queries, contact HR Department</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
