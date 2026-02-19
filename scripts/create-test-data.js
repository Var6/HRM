const http = require('http');

// Helper to make HTTP request
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function createTestData() {
  try {
    console.log('Fetching employees...');
    const employeesResult = await makeRequest('GET', '/api/employees');

    if (!employeesResult.success || !employeesResult.data || employeesResult.data.length === 0) {
      console.error('❌ No employees found');
      process.exit(1);
    }

    const firstEmployee = employeesResult.data[0];
    console.log(`✓ Using employee: ${firstEmployee.name} (${firstEmployee.employeeCode})\n`);

    // Create test requests
    const testRequests = [
      {
        employeeId: firstEmployee._id,
        requestType: 'contact',
        fieldName: 'Email',
        currentValue: 'old@company.com',
        requestedValue: 'new@company.com',
        reason: 'Changed personal email address'
      },
      {
        employeeId: firstEmployee._id,
        requestType: 'emergency',
        fieldName: 'Emergency Contact',
        currentValue: '+91 9876543210',
        requestedValue: '+91 9876543211',
        reason: 'Updated emergency contact'
      }
    ];

    console.log(`Creating ${testRequests.length} test data change requests...\n`);

    let created = 0;
    for (const testReq of testRequests) {
      const result = await makeRequest('POST', '/api/data-change-requests', testReq);
      if (result.success) {
        created++;
        console.log(`  ✓ ${testReq.fieldName} (${testReq.requestType})`);
      } else {
        console.error(`  ✗ Failed: ${testReq.fieldName} - ${result.message || result.error}`);
      }
    }

    console.log(`\n✅ Successfully created ${created}/${testRequests.length} test requests`);
    console.log('→ Refresh your Dashboard to see the new requests!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestData();
