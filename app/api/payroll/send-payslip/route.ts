import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generatePayslipHTML } from '@/lib/payroll-export-helpers';

// Create email transporter (configure with your email settings)
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee, month, year, employeeEmail, companyName } = body;

    if (!employee || !month || !year || !employeeEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate payslip HTML
    const payslipHTML = generatePayslipHTML(employee, month, year, companyName);

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: employeeEmail,
      subject: `Your Payslip for ${month} ${year}`,
      html: payslipHTML,
      replyTo: process.env.SMTP_REPLY_TO || undefined,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: `Payslip sent successfully to ${employeeEmail}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending payslip email:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send payslip email',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
