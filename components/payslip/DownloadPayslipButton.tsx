"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import PayslipDocument from "./PayslipDocument";
import { SalaryStructure } from "@/types/types";

export default function DownloadPayslipButton({ employee }: { employee: SalaryStructure }) {
  return (
    <PDFDownloadLink
      document={<PayslipDocument employee={employee} />}
      fileName={`${employee.employeeName}-Payslip.pdf`}
    >
      {({ loading }) =>
        loading ? "Generating PDF..." : "Download Payslip"
      }
    </PDFDownloadLink>
  );
}
