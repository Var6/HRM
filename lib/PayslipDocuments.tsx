import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define types
interface PayslipData {
  // Company Info
  companyName: string;
  companyAddress: string;
  month: string;
  year: string;
  
  // Employee Info
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  fatherName: string;
  dateOfJoining: string;
  panNumber: string;
  uanNumber: string;
  esiNumber: string;
  aadharNumber: string;
  
  // Attendance
  presentDays: number;
  payDays: number;
  
  // Bank Info
  modeOfPay: string;
  accountNumber: string;
  
  // Salary Components
  earnings: {
    basic: number;
    hra: number;
    conveyance: number;
    specialAllowance: number;
    monthlyBonus: number;
    quarterlyBonus?: number;
  };
  
  deductions: {
    pf: number;
    esic: number;
    advance: number;
    loan?: number;
    lop?: number;
    tds?: number;
  };
  
  // Calculated
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
  
  remarks?: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1e293b',
  },
  companyAddress: {
    fontSize: 9,
    marginBottom: 2,
    color: '#475569',
  },
  payslipTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 15,
    color: '#0f172a',
    textDecoration: 'underline',
  },
  
  // Info Section
  infoSection: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 4,
  },
  infoLabel: {
    width: '25%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#334155',
  },
  infoValue: {
    width: '25%',
    fontSize: 9,
    color: '#1e293b',
  },
  
  // Salary Table
  salarySection: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    padding: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    margineLeft:10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  earningsColumn: {
    width: '25%',
    fontSize: 9,
    color: '#1e293b',
  },
  amountColumn: {
    width: '25%',
    fontSize: 9,
    textAlign: 'right',
    color: '#1e293b',
  },
  deductionsColumn: {
    width: '25%',
    fontSize: 9,
    marginLeft: 10,
    color: '#1e293b',
  },
  
  // Total Row
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    padding: 8,
    fontWeight: 'bold',
    marginTop: 5,
  },
  totalLabel: {
    width: '25%',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#0c4a6e',
  },
  totalAmount: {
    width: '25%',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#0c4a6e',
  },
  
  // Net Pay Section
  netPaySection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    border: '2px solid #16a34a',
  },
  netPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  netPayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  netPayAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803d',
  },
  netPayWords: {
    fontSize: 9,
    color: '#166534',
    fontStyle: 'italic',
  },
  
  // Footer
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureSection: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1px solid #334155',
    marginTop: 40,
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 9,
    color: '#475569',
  },
  
  // Divider
  divider: {
    borderBottom: '2px solid #cbd5e1',
    marginVertical: 10,
  },
  
  // Remarks
  remarksSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderLeft: '3px solid #f59e0b',
  },
  remarksLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 3,
  },
  remarksText: {
    fontSize: 8,
    color: '#78350f',
  },
});

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// Main Payslip Component
export const PayslipDocument: React.FC<{ data: PayslipData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{data.companyName}</Text>
        <Text style={styles.companyAddress}>{data.companyAddress}</Text>
        <Text style={styles.payslipTitle}>
          Pay Slip for the month of {data.month}/{data.year}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Employee Information */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Emp ID:</Text>
          <Text style={styles.infoValue}>{data.employeeId}</Text>
          <Text style={styles.infoLabel}>Employee Name:</Text>
          <Text style={styles.infoValue}>{data.employeeName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Department:</Text>
          <Text style={styles.infoValue}>{data.department}</Text>
          <Text style={styles.infoLabel}>Designation:</Text>
          <Text style={styles.infoValue}>{data.designation}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Father's Name:</Text>
          <Text style={styles.infoValue}>{data.fatherName}</Text>
          <Text style={styles.infoLabel}>DOJ:</Text>
          <Text style={styles.infoValue}>{formatDate(data.dateOfJoining)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>PAN No.:</Text>
          <Text style={styles.infoValue}>{data.panNumber}</Text>
          <Text style={styles.infoLabel}>UAN No.:</Text>
          <Text style={styles.infoValue}>{data.uanNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ESI No.:</Text>
          <Text style={styles.infoValue}>{data.esiNumber}</Text>
          <Text style={styles.infoLabel}>Present Days:</Text>
          <Text style={styles.infoValue}>{data.presentDays}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pay Days:</Text>
          <Text style={styles.infoValue}>{data.payDays}</Text>
          <Text style={styles.infoLabel}>Mode of Pay:</Text>
          <Text style={styles.infoValue}>{data.modeOfPay}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>A/C No.:</Text>
          <Text style={styles.infoValue}>{data.accountNumber}</Text>
          <Text style={styles.infoLabel}>Aadhar No.:</Text>
          <Text style={styles.infoValue}>{data.aadharNumber}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Salary Details */}
      <View style={styles.salarySection}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.earningsColumn, styles.tableHeaderText]}>Emoluments</Text>
          <Text style={[styles.amountColumn, styles.tableHeaderText]}>Amount</Text>
          <Text style={[styles.deductionsColumn, styles.tableHeaderText]}>Deductions</Text>
          <Text style={[styles.amountColumn, styles.tableHeaderText]}>Amount</Text>
        </View>

        {/* Row 1: Basic / PF */}
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.earningsColumn}>BASIC</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.earnings.basic)}</Text>
          <Text style={styles.deductionsColumn}>PF</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.deductions.pf)}</Text>
        </View>

        {/* Row 2: HRA / ESIC */}
        <View style={styles.tableRow}>
          <Text style={styles.earningsColumn}>HRA</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.earnings.hra)}</Text>
          <Text style={styles.deductionsColumn}>ESIC</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.deductions.esic)}</Text>
        </View>

        {/* Row 3: Conveyance / Advance */}
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.earningsColumn}>Conveyance</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.earnings.conveyance)}</Text>
          <Text style={styles.deductionsColumn}>Advance</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.deductions.advance)}</Text>
        </View>

        {/* Row 4: Special Allowance / Loan */}
        <View style={styles.tableRow}>
          <Text style={styles.earningsColumn}>Special Allowance</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.earnings.specialAllowance)}</Text>
          <Text style={styles.deductionsColumn}>{data.deductions.loan ? 'Loan' : ''}</Text>
          <Text style={styles.amountColumn}>
            {data.deductions.loan ? formatCurrency(data.deductions.loan) : ''}
          </Text>
        </View>

        {/* Row 5: Monthly Bonus / LOP */}
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.earningsColumn}>Monthly Bonus</Text>
          <Text style={styles.amountColumn}>{formatCurrency(data.earnings.monthlyBonus)}</Text>
          <Text style={styles.deductionsColumn}>{data.deductions.lop ? 'LOP' : ''}</Text>
          <Text style={styles.amountColumn}>
            {data.deductions.lop ? formatCurrency(data.deductions.lop) : ''}
          </Text>
        </View>

        {/* Row 6: Quarterly Bonus / TDS (if applicable) */}
        {(data.earnings.quarterlyBonus || data.deductions.tds) && (
          <View style={styles.tableRow}>
            <Text style={styles.earningsColumn}>
              {data.earnings.quarterlyBonus ? 'Quarterly Bonus' : ''}
            </Text>
            <Text style={styles.amountColumn}>
              {data.earnings.quarterlyBonus ? formatCurrency(data.earnings.quarterlyBonus) : ''}
            </Text>
            <Text style={styles.deductionsColumn}>{data.deductions.tds ? 'TDS' : ''}</Text>
            <Text style={styles.amountColumn}>
              {data.deductions.tds ? formatCurrency(data.deductions.tds) : ''}
            </Text>
          </View>
        )}

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(data.totalEarnings)}</Text>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(data.totalDeductions)}</Text>
        </View>
      </View>

      {/* Net Pay */}
      <View style={styles.netPaySection}>
        <View style={styles.netPayRow}>
          <Text style={styles.netPayLabel}>Net Pay (Take Home)</Text>
          <Text style={styles.netPayAmount}>{formatCurrency(data.netPay)}</Text>
        </View>
        <Text style={styles.netPayWords}>In Words: {data.netPayInWords}</Text>
      </View>

      {/* Remarks */}
      {data.remarks && (
        <View style={styles.remarksSection}>
          <Text style={styles.remarksLabel}>Remarks:</Text>
          <Text style={styles.remarksText}>{data.remarks}</Text>
        </View>
      )}

      {/* Footer / Signature */}
      <View style={styles.footer}>
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Employee Signature</Text>
          </View>
        </View>
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Authorized Signatory</Text>
          </View>
        </View>
      </View>

      {/* Watermark / Footer Note */}
      <View style={{ marginTop: 20, textAlign: 'center' }}>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>
          This is a computer-generated payslip and does not require a signature.
        </Text>
      </View>
    </Page>
  </Document>
);

// Export helper function to convert number to words (Indian system)
export const numberToWordsIndian = (num: number): string => {
  if (num === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  let result = '';

  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (hundred > 0) result += convertLessThanThousand(hundred);

  // Handle decimal part (paise)
  const decimalPart = Math.round((num - Math.floor(num)) * 100);
  if (decimalPart > 0) {
    result += ' and ' + convertLessThanThousand(decimalPart) + ' Paise';
  }

  return result.trim() + ' Only';
};

export default PayslipDocument;