const BASE_URL = 'http://localhost:5000';

async function testAllRoutes() {
  console.log('--- Comprehensive Backend Route Integrity Test ---');
  let errors = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      errors++;
    }
  }

  await check('GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== 'healthy') throw new Error(`Unexpected status ${json.status}`);
  });

  await check('GET /api/dashboard (empty params)', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('success is false');
  });

  await check('GET /api/dsa', async () => {
    const res = await fetch(`${BASE_URL}/api/dsa`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('success is false');
    if (!Array.isArray(json.problems)) throw new Error('problems is not an array');
  });

  let createdProbId = null;
  await check('POST /api/dsa/problems (Add Problem)', async () => {
    const res = await fetch(`${BASE_URL}/api/dsa/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Test Problem ${Date.now()}`,
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        problemUrl: 'https://leetcode.com/problems/climbing-stairs'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.problem?.id) throw new Error('Problem not created');
    createdProbId = json.problem.id;
  });

  if (createdProbId) {
    await check('PATCH /api/dsa/problems/:id (Update Problem)', async () => {
      const res = await fetch(`${BASE_URL}/api/dsa/problems/${createdProbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Solved',
          notes: 'Tested note update'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('Problem not updated');
    });

    await check('DELETE /api/dsa/problems/:id (Delete Problem)', async () => {
      const res = await fetch(`${BASE_URL}/api/dsa/problems/${createdProbId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('Problem not deleted');
    });
  }

  await check('GET /api/webdev', async () => {
    const res = await fetch(`${BASE_URL}/api/webdev`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.roadmaps) throw new Error('Invalid webdev data');
  });

  await check('GET /api/systemdesign', async () => {
    const res = await fetch(`${BASE_URL}/api/systemdesign`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.topics) throw new Error('Invalid systemdesign data');
  });

  await check('GET /api/github/unlinked', async () => {
    const res = await fetch(`${BASE_URL}/api/github/unlinked`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('unlinked github fetch failed');
  });

  await check('GET /api/readiness', async () => {
    const res = await fetch(`${BASE_URL}/api/readiness`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || typeof json.readiness?.overallScore !== 'number') throw new Error('readiness failed');
  });

  await check('GET /api/auth/config', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('auth config failed');
  });

  await check('GET /api/public/profile/demo', async () => {
    const res = await fetch(`${BASE_URL}/api/public/profile/demo`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.profile?.name) throw new Error('profile demo failed');
  });

  if (errors > 0) {
    console.error(`\nFailed with ${errors} error(s)!`);
    process.exit(1);
  } else {
    console.log('\n>>> All Backend Route Integrity Checks Passed Successfully! <<<');
  }
}

testAllRoutes().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
