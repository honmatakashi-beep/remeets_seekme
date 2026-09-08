async function testApiLatency() {
  const endpoints = [
    { name: 'GET /api/posts', url: 'http://localhost:3000/api/posts?page=1&limit=15' },
    { name: 'GET /api/posts/summary', url: 'http://localhost:3000/api/posts/summary' },
    { name: 'GET /api/auth/password-policy', url: 'http://localhost:3000/api/auth/password-policy' },
    { name: 'POST /api/auth/login (Admin)', url: 'http://localhost:3000/api/auth/login', method: 'POST', body: { username: 'admin', password: 'admin123' } }
  ];

  console.log('--- ⏱️ Measuring API Response Latencies ---');
  let adminToken = '';

  for (const ep of endpoints) {
    const start = performance.now();
    try {
      const opts = {
        method: ep.method || 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      if (ep.body) opts.body = JSON.stringify(ep.body);
      const res = await fetch(ep.url, opts);
      const data = await res.json();
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[${res.status}] ${ep.name.padEnd(35)} : ${duration} ms`);
      if (ep.name.includes('login') && data.token) {
        adminToken = data.token;
      }
    } catch (e) {
      console.error(`❌ ${ep.name} failed:`, e.message);
    }
  }

  if (adminToken) {
    const adminEndpoints = [
      { name: 'GET /api/admin/stats', url: 'http://localhost:3000/api/admin/stats' },
      { name: 'GET /api/admin/security-stats', url: 'http://localhost:3000/api/admin/security-stats' },
      { name: 'GET /api/admin/users', url: 'http://localhost:3000/api/admin/users?page=1&limit=15' },
      { name: 'GET /api/admin/posts', url: 'http://localhost:3000/api/admin/posts?page=1&limit=15' },
      { name: 'GET /api/admin/reports', url: 'http://localhost:3000/api/admin/reports' },
      { name: 'GET /api/admin/ng-words', url: 'http://localhost:3000/api/admin/ng-words' }
    ];

    console.log('\n--- ⏱️ Measuring Admin Dashboard API Latencies ---');
    for (const ep of adminEndpoints) {
      const start = performance.now();
      try {
        const res = await fetch(ep.url, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        const duration = (performance.now() - start).toFixed(2);
        console.log(`[${res.status}] ${ep.name.padEnd(35)} : ${duration} ms`);
      } catch (e) {
        console.error(`❌ ${ep.name} failed:`, e.message);
      }
    }
  }
}

testApiLatency();
