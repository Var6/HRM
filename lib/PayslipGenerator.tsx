'use client';
import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { Download, Eye, Send, Loader2 } from 'lucide-react';
import { PayslipDocument } from './PayslipDocuments';
import { 
  downloadPayslip, 
  generatePayslipURL, 
  emailPayslip,
  type EmployeeSalaryData,
  calculatePayslipData
} from './payslip-utils';

interface PayslipGeneratorProps {
  employee: EmployeeSalaryData;
  month: string;
  year: string;
}

/**
 * Payslip Generator Component
 * Use this component to preview, download, or email payslips
 */
export const PayslipGenerator: React.FC<PayslipGeneratorProps> = ({ 
  employee, 
  month, 
  year 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const payslipData = calculatePayslipData(employee, month, year);

  const handleDownload = async () => {
    setIsLoading(true);
    setMessage(null);
    
    const result = await downloadPayslip(employee, month, year);
    
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setIsLoading(false);
  };

  const handleEmail = async () => {
    const email = prompt('Enter email address:');
    if (!email) return;

    setIsLoading(true);
    setMessage(null);
    
    const result = await emailPayslip(employee, month, year, email);
    
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 px-4 py-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-all flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide Preview' : 'Preview'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download
        </button>
        
        <button
          onClick={handleEmail}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Email
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* PDF Preview */}
      {showPreview && (
        <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 p-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              Payslip Preview - {employee.employeeName} ({month}/{year})
            </p>
          </div>
          <div style={{ height: '800px' }}>
            <PDFViewer width="100%" height="100%">
              <PayslipDocument data={payslipData} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Payslip Button Component
 * Simple button component for inline usage in tables or cards
 */
interface PayslipButtonProps {
  employee: EmployeeSalaryData;
  month: string;
  year: string;
  variant?: 'download' | 'preview' | 'email';
  className?: string;
}

export const PayslipButton: React.FC<PayslipButtonProps> = ({
  employee,
  month,
  year,
  variant = 'download',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    if (variant === 'download') {
      await downloadPayslip(employee, month, year);
    } else if (variant === 'email') {
      const email = prompt('Enter email address:');
      if (email) {
        await emailPayslip(employee, month, year, email);
      }
    } else if (variant === 'preview') {
      const url = await generatePayslipURL(employee, month, year);
      window.open(url, '_blank');
    }

    setIsLoading(false);
  };

  const icons = {
    download: Download,
    preview: Eye,
    email: Send,
  };

  const Icon = icons[variant];

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
};

export default PayslipGenerator;