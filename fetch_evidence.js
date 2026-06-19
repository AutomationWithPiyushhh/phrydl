const fs = require('fs');

async function run() {
  const loginRes = await fetch("http://localhost:8081/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "superadmin@phrydlpg.com", password: "SuperAdmin@123" })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const headers = { "Authorization": `Bearer ${token}` };

  console.log("=== API EVIDENCE LOG ===");

  // 1. Dashboard Stats
  console.log("\n[1] Dashboard Stats:");
  try {
    const dRes = await fetch("http://localhost:8081/api/v1/dashboard", { headers });
    console.log(JSON.stringify(await dRes.json(), null, 2));
  } catch(e) { console.log(e.message); }

  // 2. Payment Stats
  console.log("\n[2] Payment Stats:");
  try {
    const pRes = await fetch("http://localhost:8081/api/v1/payments/stats", { headers });
    console.log(JSON.stringify(await pRes.json(), null, 2));
  } catch(e) { console.log(e.message); }

  // 3. Expense Stats
  console.log("\n[3] Expense Stats:");
  try {
    const eRes = await fetch("http://localhost:8081/api/v1/expenses/stats", { headers });
    console.log(JSON.stringify(await eRes.json(), null, 2));
  } catch(e) { console.log(e.message); }

  // 4. Property Matrix
  console.log("\n[4] Property Matrix (First Property):");
  try {
    const propRes = await fetch("http://localhost:8081/api/v1/properties", { headers });
    const props = await propRes.json();
    if (props.data && props.data.length > 0) {
      const pId = props.data[0].id;
      const matrixRes = await fetch(`http://localhost:8081/api/v1/properties/${pId}/matrix`, { headers });
      console.log(JSON.stringify(await matrixRes.json(), null, 2).substring(0, 500) + "... (truncated)");
    }
  } catch(e) { console.log(e.message); }

  // 5. Duplicate Allocation Conflict
  console.log("\n[5] Duplicate Allocation Conflict Check:");
  try {
    // Try to allocate a bed that is probably occupied
    // We'll just fetch beds and find an occupied one, or just try to assign a random tenant
    const tRes = await fetch("http://localhost:8081/api/v1/tenants", { headers });
    const tenants = await tRes.json();
    if (tenants.data && tenants.data.length > 0) {
       const tId = tenants.data[0].id;
       const bId = tenants.data[0].bedId;
       const allocRes = await fetch(`http://localhost:8081/api/v1/tenants/${tId}/allocate-bed?bedId=${bId}`, { 
          method: "PUT",
          headers
       });
       console.log(`Status: ${allocRes.status}`);
       console.log(JSON.stringify(await allocRes.json(), null, 2));
    }
  } catch(e) { console.log(e.message); }

  // 6. Security check - No token
  console.log("\n[6] Security Check (No Token):");
  try {
    const sRes = await fetch("http://localhost:8081/api/v1/dashboard/stats");
    console.log(`Status: ${sRes.status}`);
  } catch(e) { console.log(e.message); }

}
run();
