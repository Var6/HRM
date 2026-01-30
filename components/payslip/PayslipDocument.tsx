import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { SalaryStructure } from "@/types/types";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  header: { fontSize: 16, marginBottom: 10, fontWeight: "bold" },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "bold" },
  box: { border: "1px solid #000", padding: 8, marginBottom: 10 }
});

export default function PayslipDocument({ employee }: { employee: SalaryStructure }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <Text style={styles.header}>CITIZEN COOPERATIVE - PAYSLIP</Text>

        {/* Employee Info */}
        <View style={styles.box}>
          <Text>Name: {employee.employeeName}</Text>
          <Text>Code: {employee.employeeCode}</Text>
          <Text>Designation: {employee.designation}</Text>
          <Text>Department: {employee.department}</Text>
          <Text>Bank A/C: {employee.bankAccount}</Text>
        </View>

        {/* Earnings */}
        <View style={styles.box}>
          <Text style={styles.bold}>EARNINGS</Text>
          <View style={styles.row}><Text>Basic</Text><Text>{employee.earnings.basic}</Text></View>
          <View style={styles.row}><Text>HRA</Text><Text>{employee.earnings.hra}</Text></View>
          <View style={styles.row}><Text>Conveyance</Text><Text>{employee.earnings.conveyance}</Text></View>
          <View style={styles.row}><Text>Bonus</Text><Text>{employee.earnings.monthlyBonus}</Text></View>
          <View style={styles.row}><Text>Special Allowance</Text><Text>{employee.earnings.specialAllowance}</Text></View>
          <View style={styles.row}><Text style={styles.bold}>Gross Salary</Text><Text>{employee.grossSalary}</Text></View>
        </View>

        {/* Deductions */}
        <View style={styles.box}>
          <Text style={styles.bold}>DEDUCTIONS</Text>
          <View style={styles.row}><Text>PF</Text><Text>{employee.deductions.pf}</Text></View>
          <View style={styles.row}><Text>ESIC</Text><Text>{employee.deductions.esic}</Text></View>
          <View style={styles.row}><Text>Loan</Text><Text>{employee.deductions.loan}</Text></View>
          <View style={styles.row}><Text>TDS</Text><Text>{employee.deductions.tds}</Text></View>
          <View style={styles.row}><Text style={styles.bold}>Total Deductions</Text><Text>{employee.totalDeductions}</Text></View>
        </View>

        {/* Net Salary */}
        <View style={styles.box}>
          <Text style={styles.bold}>NET SALARY: ₹ {employee.netSalary}</Text>
        </View>

      </Page>
    </Document>
  );
}
