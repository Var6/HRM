import mongoose from 'mongoose';
import Employee from '../models/Employee';

const employees = [
  {
    employeeCode: 'EMP001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@citizencoop.com',
    phone: '9876543210',
    mobileNumber: '9876543210',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'Male',
    address: '123 MG Road, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560001',
    country: 'India',
    department: 'Finance',
    designation: 'Senior Accountant',
    joiningDate: new Date('2020-01-15'),
    employmentType: 'Full-time',
    salary: 65000,
    basicSalary: 40000,
    hra: 15000,
    allowances: 10000,
    bankName: 'State Bank of India',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    panNumber: 'ABCDE1234F',
    aadharNumber: '123456789012',
    emergencyContactName: 'Priya Kumar',
    emergencyContactNumber: '9876543211',
    emergencyContactRelation: 'Spouse',
    status: 'Active',
    performanceRating: 4.5
  },
  {
    employeeCode: 'EMP002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@citizencoop.com',
    phone: '9876543220',
    mobileNumber: '9876543220',
    dateOfBirth: new Date('1992-08-22'),
    gender: 'Female',
    address: '456 Park Street, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India',
    department: 'HR',
    designation: 'HR Manager',
    joiningDate: new Date('2019-06-01'),
    employmentType: 'Full-time',
    salary: 75000,
    basicSalary: 45000,
    hra: 18000,
    allowances: 12000,
    bankName: 'HDFC Bank',
    accountNumber: '2345678901',
    ifscCode: 'HDFC0001234',
    panNumber: 'BCDEF2345G',
    aadharNumber: '234567890123',
    emergencyContactName: 'Rakesh Sharma',
    emergencyContactNumber: '9876543221',
    emergencyContactRelation: 'Father',
    status: 'Active',
    performanceRating: 4.8
  },
  {
    employeeCode: 'EMP003',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@citizencoop.com',
    phone: '9876543230',
    mobileNumber: '9876543230',
    dateOfBirth: new Date('1988-03-10'),
    gender: 'Male',
    address: '789 Ring Road, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '380001',
    country: 'India',
    department: 'IT',
    designation: 'Software Developer',
    joiningDate: new Date('2021-03-20'),
    employmentType: 'Full-time',
    salary: 80000,
    basicSalary: 50000,
    hra: 20000,
    allowances: 10000,
    bankName: 'ICICI Bank',
    accountNumber: '3456789012',
    ifscCode: 'ICIC0001234',
    panNumber: 'CDEFG3456H',
    aadharNumber: '345678901234',
    emergencyContactName: 'Neha Patel',
    emergencyContactNumber: '9876543231',
    emergencyContactRelation: 'Sister',
    status: 'Active',
    performanceRating: 4.2
  },
  {
    employeeCode: 'EMP004',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@citizencoop.com',
    phone: '9876543240',
    mobileNumber: '9876543240',
    dateOfBirth: new Date('1995-11-28'),
    gender: 'Female',
    address: '321 Jubilee Hills, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500001',
    country: 'India',
    department: 'Operations',
    designation: 'Operations Executive',
    joiningDate: new Date('2022-07-10'),
    employmentType: 'Full-time',
    salary: 55000,
    basicSalary: 35000,
    hra: 12000,
    allowances: 8000,
    bankName: 'Axis Bank',
    accountNumber: '4567890123',
    ifscCode: 'UTIB0001234',
    panNumber: 'DEFGH4567I',
    aadharNumber: '456789012345',
    emergencyContactName: 'Ramesh Reddy',
    emergencyContactNumber: '9876543241',
    emergencyContactRelation: 'Father',
    status: 'Active',
    performanceRating: 4.0
  },
  {
    employeeCode: 'EMP005',
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@citizencoop.com',
    phone: '9876543250',
    mobileNumber: '9876543250',
    dateOfBirth: new Date('1987-09-05'),
    gender: 'Male',
    address: '654 Civil Lines, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    country: 'India',
    department: 'Marketing',
    designation: 'Marketing Manager',
    joiningDate: new Date('2018-11-25'),
    employmentType: 'Full-time',
    salary: 85000,
    basicSalary: 52000,
    hra: 21000,
    allowances: 12000,
    bankName: 'Punjab National Bank',
    accountNumber: '5678901234',
    ifscCode: 'PUNB0001234',
    panNumber: 'EFGHI5678J',
    aadharNumber: '567890123456',
    emergencyContactName: 'Kavita Singh',
    emergencyContactNumber: '9876543251',
    emergencyContactRelation: 'Spouse',
    status: 'Active',
    performanceRating: 4.6
  }
];

export async function seedEmployees() {
  try {
    // Clear existing employees (optional)
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    // Insert new employees
    const result = await Employee.insertMany(employees);
    console.log(`Successfully seeded ${result.length} employees`);
    
    return { success: true, count: result.length, employees: result };
  } catch (error) {
    console.error('Error seeding employees:', error);
    return { success: false, error };
  }
}

// For standalone execution
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm';
  
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      const result = await seedEmployees();
      console.log('Seed result:', result);
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

export default employees;
