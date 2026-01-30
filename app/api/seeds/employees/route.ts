import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function POST() {
  try {
    await connectDB();

    // 🔥 Clean old broken records
    await Employee.deleteMany();

    const employees = await Employee.insertMany([
      {
        employeeCode: "EMP-001",
        name: "Amit Kumar",
        email: "amit@company.com",
        phone: "9000000001",
        department: "HR",
        role: "HR Manager",
        status: "active",
        joiningDate: new Date("2023-01-10"),

        salary: {
          amount: 45000,
          currency: "INR",
          type: "monthly",
        },

        address: {
          city: "Patna",
          state: "Bihar",
          country: "India",
        },
      },
      {
        employeeCode: "EMP-002",
        name: "Neha Sharma",
        email: "neha@company.com",
        phone: "9000000002",
        department: "Engineering",
        role: "Frontend Developer",
        status: "active",
        joiningDate: new Date("2023-03-15"),

        salary: {
          amount: 65000,
          currency: "INR",
          type: "monthly",
        },

        address: {
          city: "Delhi",
          state: "Delhi",
          country: "India",
        },
      },
      {
        employeeCode: "EMP-003",
        name: "Rohit Verma",
        email: "rohit@company.com",
        phone: "9000000003",
        department: "Finance",
        role: "Accountant",
        status: "active",
        joiningDate: new Date("2022-11-01"),

        salary: {
          amount: 55000,
          currency: "INR",
          type: "monthly",
        },

        address: {
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
        },
      },
      {
  employeeCode: "EMP-004",
  name: "Pooja Singh",
  email: "pooja.singh@company.com",
  phone: "9000000004",
  department: "Operations",
  role: "Operations Executive",
  status: "active",
  joiningDate: new Date("2024-02-01"),

  salary: {
    amount: 40000,
    currency: "INR",
    type: "monthly",
  },

  address: {
    city: "Lucknow",
    state: "Uttar Pradesh",
    country: "India",
  },
},
{
  employeeCode: "EMP-005",
  name: "Saurabh Mishra",
  email: "saurabh.mishra@company.com",
  phone: "9000000005",
  department: "IT",
  role: "Backend Developer",
  status: "active",
  joiningDate: new Date("2022-08-18"),

  salary: {
    amount: 80000,
    currency: "INR",
    type: "monthly",
  },

  address: {
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
  },
},
{
  employeeCode: "EMP-006",
  name: "Anjali Gupta",
  email: "anjali.gupta@company.com",
  phone: "9000000006",
  department: "Sales",
  role: "Sales Manager",
  status: "active",
  joiningDate: new Date("2021-05-10"),

  salary: {
    amount: 70000,
    currency: "INR",
    type: "monthly",
  },

  address: {
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
  },
}

    ]);

    return NextResponse.json({
      success: true,
      count: employees.length,
      message: "Employees seeded successfully",
    });
  } catch (error: any) {
    console.error("SEED ERROR 👉", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
