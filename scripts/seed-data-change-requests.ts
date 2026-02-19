import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import DataChangeRequest from '@/models/DataChangeRequest';

async function seedDataChangeRequests() {
  try {
    await connectDB();

    // Get first few employees
    const employees = await Employee.find().limit(3);

    if (employees.length === 0) {
      console.log('No employees found. Please create employees first.');
      process.exit(1);
    }

    // Clear existing data change requests
    await DataChangeRequest.deleteMany({});
    console.log('Cleared existing data change requests');

    // Create test data change requests
    const testRequests = [
      {
        employeeId: employees[0]._id,
        employeeCode: employees[0].employeeCode,
        employeeName: employees[0].name,
        requestType: 'contact',
        fieldName: 'Email',
        currentValue: 'old.email@company.com',
        requestedValue: 'new.email@company.com',
        reason: 'Changed personal email',
        department: employees[0].department,
        status: 'pending'
      },
      {
        employeeId: employees[0]._id,
        employeeCode: employees[0].employeeCode,
        employeeName: employees[0].name,
        requestType: 'emergency',
        fieldName: 'Emergency Contact Number',
        currentValue: '+91 98765 43210',
        requestedValue: '+91 87654 32109',
        reason: 'Updated emergency contact',
        department: employees[0].department,
        status: 'approved',
        hrRemarks: 'Contact updated successfully'
      },
      ...(employees[1] ? [{
        employeeId: employees[1]._id,
        employeeCode: employees[1].employeeCode,
        employeeName: employees[1].name,
        requestType: 'bank',
        fieldName: 'Bank Account Number',
        currentValue: '1234567890123456',
        requestedValue: '9876543210987654',
        reason: 'Account with new bank',
        department: employees[1].department,
        status: 'rejection',
        rejectionReason: 'Bank account change requires additional verification'
      }] : []),
      ...(employees[2] ? [{
        employeeId: employees[2]._id,
        employeeCode: employees[2].employeeCode,
        employeeName: employees[2].name,
        requestType: 'personal',
        fieldName: 'Marital Status',
        currentValue: 'Single',
        requestedValue: 'Married',
        reason: 'Recently got married',
        department: employees[2].department,
        status: 'pending'
      }] : [])
    ];

    const createdRequests = await DataChangeRequest.insertMany(testRequests);
    console.log(`✅ Created ${createdRequests.length} test data change requests`);
    console.log('Sample records:');
    createdRequests.forEach((req) => {
      console.log(`  - ${req.employeeName}: ${req.fieldName} (${req.status})`);
    });

  } catch (error) {
    console.error('Error seeding data change requests:', error);
    process.exit(1);
  }
}

seedDataChangeRequests().then(() => {
  console.log('✅ Seed completed successfully');
  process.exit(0);
});
