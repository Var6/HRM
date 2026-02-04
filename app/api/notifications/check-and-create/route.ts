import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Notification from "@/models/Notification";

/**
 * CHECK AND CREATE NOTIFICATIONS
 * POST /api/notifications/check-and-create
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all employees
    const employees = await Employee.find();

    const notificationsToCreate = [];

    for (const employee of employees) {
      // 1. BIRTHDAY NOTIFICATIONS (1 day prior and on the day)
      if (employee.dateOfBirth) {
        const dob = new Date(employee.dateOfBirth);
        const currentYear = today.getFullYear();
        const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());

        // Check if birthday is today
        if (
          birthdayThisYear.getDate() === today.getDate() &&
          birthdayThisYear.getMonth() === today.getMonth()
        ) {
          const existingBirthdayNotif = await Notification.findOne({
            employeeId: employee._id,
            type: 'birthday',
            createdAt: { $gte: today },
          });

          if (!existingBirthdayNotif) {
            notificationsToCreate.push({
              type: 'birthday',
              employeeId: employee._id,
              employeeName: employee.name,
              title: `${employee.name}'s Birthday`,
              message: `Today is ${employee.name}'s birthday! Send your wishes.`,
              priority: 'high',
              actionUrl: `/Dashboard/employees/${employee._id}`,
            });
          }
        }

        // Check if birthday is tomorrow (1 day prior)
        if (
          birthdayThisYear.getDate() === tomorrow.getDate() &&
          birthdayThisYear.getMonth() === tomorrow.getMonth()
        ) {
          const existingPriorNotif = await Notification.findOne({
            employeeId: employee._id,
            type: 'birthday',
            createdAt: { $gte: tomorrow },
          });

          if (!existingPriorNotif) {
            notificationsToCreate.push({
              type: 'birthday',
              employeeId: employee._id,
              employeeName: employee.name,
              title: `Upcoming Birthday`,
              message: `${employee.name}'s birthday is tomorrow!`,
              priority: 'medium',
              actionUrl: `/Dashboard/employees/${employee._id}`,
            });
          }
        }
      }

      // 2. RETIREMENT NOTIFICATIONS
      if (employee.dateOfBirth) {
        const dob = new Date(employee.dateOfBirth);
        const retirementDate = new Date(dob.getFullYear() + 60, dob.getMonth(), dob.getDate());
        const daysUntilRetirement = Math.floor((retirementDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Notify when retirement is within 6 months
        if (daysUntilRetirement > 0 && daysUntilRetirement <= 180) {
          const existingRetirementNotif = await Notification.findOne({
            employeeId: employee._id,
            type: 'retirement',
            createdAt: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) }, // Check last 7 days
          });

          if (!existingRetirementNotif) {
            notificationsToCreate.push({
              type: 'retirement',
              employeeId: employee._id,
              employeeName: employee.name,
              title: 'Upcoming Retirement',
              message: `${employee.name} will retire on ${retirementDate.toLocaleDateString('en-IN')} (${Math.floor(daysUntilRetirement / 30)} months from now)`,
              priority: 'high',
              dueDate: retirementDate,
              actionUrl: `/Dashboard/employees/${employee._id}`,
            });
          }
        }
      }

      // 3. MISSING FIELDS NOTIFICATION
      const requiredFields = [
        'name', 'dateOfBirth', 'fatherName', 'motherName', 'maritalStatus',
        'educationQualification', 'permanentAddress', 'correspondenceAddress',
        'EcontactNo', 'mobileNumber', 'email', 'employeeCode', 'dateOfJoining',
        'department', 'designation', 'branchName', 'modeOfPayment'
      ];

      const missingFields = requiredFields.filter(field => !employee[field] || (typeof employee[field] === 'string' && !employee[field].trim()));

      if (missingFields.length > 0) {
        const existingMissingNotif = await Notification.findOne({
          employeeId: employee._id,
          type: 'missing_field',
          createdAt: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) }, // Check last 24 hours
        });

        if (!existingMissingNotif) {
          notificationsToCreate.push({
            type: 'missing_field',
            employeeId: employee._id,
            employeeName: employee.name,
            title: 'Missing Employee Information',
            message: `${employee.name}'s profile is incomplete. Missing: ${missingFields.join(', ')}`,
            priority: 'medium',
            actionUrl: `/Dashboard/recruitment/${employee._id}`,
            metadata: { missingFields },
          });
        }
      }

      // 4. EMERGENCY CONTACT VALIDATION
      if (!employee.EcontactNo || !employee.mobileNumber) {
        const existingEmergencyNotif = await Notification.findOne({
          employeeId: employee._id,
          type: 'emergency_contact',
          createdAt: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) }, // Check last 24 hours
        });

        if (!existingEmergencyNotif) {
          notificationsToCreate.push({
            type: 'emergency_contact',
            employeeId: employee._id,
            employeeName: employee.name,
            title: 'Missing Emergency Contact',
            message: `${employee.name} is missing emergency contact information`,
            priority: 'high',
            actionUrl: `/Dashboard/recruitment/${employee._id}`,
          });
        }
      }
    }

    // 5. PAYSLIP AND ATTENDANCE REMINDER (3rd last day of month)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thirdLastDay = new Date(lastDayOfMonth);
    thirdLastDay.setDate(lastDayOfMonth.getDate() - 2);

    if (today.getDate() === thirdLastDay.getDate()) {
      const existingPayslipNotif = await Notification.findOne({
        type: 'payslip',
        createdAt: { $gte: today },
      });

      if (!existingPayslipNotif) {
        notificationsToCreate.push({
          type: 'payslip',
          employeeName: 'All',
          title: 'Payslips Processing Reminder',
          message: 'Process payslips for all employees before month-end',
          priority: 'high',
          actionUrl: `/Dashboard/payroll`,
        });
      }

      const existingAttendanceNotif = await Notification.findOne({
        type: 'attendance',
        createdAt: { $gte: today },
      });

      if (!existingAttendanceNotif) {
        notificationsToCreate.push({
          type: 'attendance',
          employeeName: 'All',
          title: 'Attendance Review Reminder',
          message: 'Review and finalize attendance records before month-end',
          priority: 'high',
          actionUrl: `/Dashboard/attendance`,
        });
      }
    }

    // Create all notifications
    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    return NextResponse.json({
      success: true,
      created: notificationsToCreate.length,
      notifications: notificationsToCreate,
    });
  } catch (error) {
    console.error("Check notifications error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
