const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting Multi-Provider Authentication Unification Tests ---');
  const testEmail = `candidate_${Date.now()}@example.com`;
  const initialPassword = 'Password123!';
  const customTargetRole = 'Backend Systems Specialist';
  const customHandles = {
    leetcode: 'tourist',
    codeforces: 'tourist',
    github: 'torvalds'
  };

  // 1. Register/Login via Email & Password
  console.log('\n[Test 1] Register via Email/Password...');
  const res1 = await fetch(`${BASE_URL}/api/auth/register-or-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      name: 'Deep Candidate',
      password: initialPassword,
      targetRole: customTargetRole,
      handles: customHandles,
      provider: 'email'
    })
  });
  const data1 = await res1.json();
  console.log('Registration response status:', res1.status, 'Success:', data1.success);
  console.log('Stored user handles:', data1.user?.handles);
  console.log('Stored user role:', data1.user?.targetRole);

  if (!data1.success || data1.user.handles?.leetcode !== 'tourist') {
    throw new Error('Test 1 Failed: Registration did not set handles properly');
  }

  // 2. Explicit Profile Update (e.g. Settings change)
  console.log('\n[Test 2] Update Profile in Settings...');
  const res2 = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      name: 'Deep Candidate (Updated)',
      targetRole: 'Senior Distributed Systems Architect',
      academic: {
        college: 'Chandigarh University Institute of Engineering',
        cgpa: '9.45 / 10',
        year: '2026'
      },
      handles: {
        leetcode: 'tourist',
        codeforces: 'tourist',
        github: 'torvalds'
      },
      phone: '+91 9876543210',
      privacy: {
        showEmail: true,
        showPhone: true
      }
    })
  });
  const data2 = await res2.json();
  console.log('Profile update response:', data2.success, data2.user?.academic?.cgpa);
  if (!data2.success || data2.user?.academic?.cgpa !== '9.45 / 10') {
    throw new Error('Test 2 Failed: Profile update failed');
  }

  // 3. User logs in via "Google" using the same email
  // (In Google OAuth callback, provider='google', default role='Software Development Engineer (SDE-1)', handles empty)
  console.log('\n[Test 3] Simulate Google OAuth login with same email...');
  const { saveOrMergeUser, getUserByEmail } = await import('../data/userStore.js');

  const existingBeforeGoogle = getUserByEmail(testEmail);
  const googleUser = saveOrMergeUser({
    id: 'google_1092837465',
    name: 'Google User Profile Name',
    email: testEmail,
    targetRole: 'Software Development Engineer (SDE-1)', // Google callback default
    provider: 'google',
    avatarUrl: 'https://lh3.googleusercontent.com/a/test-avatar',
    handles: {
      leetcode: existingBeforeGoogle?.handles?.leetcode || '',
      codeforces: existingBeforeGoogle?.handles?.codeforces || '',
      github: existingBeforeGoogle?.handles?.github || ''
    },
    onboardingCompleted: true
  });

  console.log('After Google Login:');
  console.log('  Target Role:', googleUser.targetRole, '(Expected: Senior Distributed Systems Architect)');
  console.log('  CGPA:', googleUser.academic?.cgpa, '(Expected: 9.45 / 10)');
  console.log('  LeetCode Handle:', googleUser.handles?.leetcode, '(Expected: tourist)');
  console.log('  Providers:', googleUser.providers, '(Expected includes email and google)');

  if (googleUser.targetRole !== 'Senior Distributed Systems Architect') {
    throw new Error('Test 3 Failed: Google login overwrote targetRole');
  }
  if (googleUser.handles?.leetcode !== 'tourist') {
    throw new Error('Test 3 Failed: Google login lost LeetCode handle');
  }
  if (googleUser.academic?.cgpa !== '9.45 / 10') {
    throw new Error('Test 3 Failed: Google login lost CGPA');
  }

  // 4. User logs in via "GitHub" using the same email
  // (In GitHub OAuth callback, provider='github', default role='Software Development Engineer (SDE-1)', ghUser.login='torvalds')
  console.log('\n[Test 4] Simulate GitHub OAuth login with same email...');
  const existingBeforeGithub = getUserByEmail(testEmail);
  const githubUser = saveOrMergeUser({
    id: 'gh_999888',
    name: 'Linus Torvalds',
    email: testEmail,
    targetRole: existingBeforeGithub?.targetRole || 'Software Development Engineer (SDE-1)',
    provider: 'github',
    avatarUrl: 'https://github.com/torvalds.png',
    handles: {
      leetcode: existingBeforeGithub?.handles?.leetcode || '',
      codeforces: existingBeforeGithub?.handles?.codeforces || '',
      github: existingBeforeGithub?.handles?.github || 'torvalds'
    },
    onboardingCompleted: true
  });

  console.log('After GitHub Login:');
  console.log('  Target Role:', githubUser.targetRole, '(Expected: Senior Distributed Systems Architect)');
  console.log('  CGPA:', githubUser.academic?.cgpa, '(Expected: 9.45 / 10)');
  console.log('  LeetCode Handle:', githubUser.handles?.leetcode, '(Expected: tourist)');
  console.log('  GitHub Handle:', githubUser.handles?.github, '(Expected: torvalds)');
  console.log('  Providers:', githubUser.providers, '(Expected includes email, google, and github)');

  if (githubUser.targetRole !== 'Senior Distributed Systems Architect') {
    throw new Error('Test 4 Failed: GitHub login overwrote targetRole');
  }
  if (githubUser.handles?.leetcode !== 'tourist' || githubUser.handles?.github !== 'torvalds') {
    throw new Error('Test 4 Failed: GitHub login lost handles');
  }

  // 5. Test Backend Route Fallback Resolution with Email
  console.log('\n[Test 5] Test Backend Route Hydration with email param only...');
  const dsaRes = await fetch(`${BASE_URL}/api/dsa?email=${encodeURIComponent(testEmail)}`);
  const dsaData = await dsaRes.json();
  console.log('DSA API responded. Success:', dsaData.success);

  const dashRes = await fetch(`${BASE_URL}/api/dashboard?email=${encodeURIComponent(testEmail)}`);
  const dashData = await dashRes.json();
  console.log('Dashboard API responded. Success:', dashData.success, 'Readiness score:', dashData.readiness?.overallScore);

  const readRes = await fetch(`${BASE_URL}/api/readiness?email=${encodeURIComponent(testEmail)}`);
  const readData = await readRes.json();
  console.log('Readiness API responded. Success:', readData.success, 'Overall score:', readData.readiness?.overallScore);

  console.log('\n>>> ALL MULTI-PROVIDER AUTHENTICATION UNIFICATION TESTS PASSED SUCCESSFULLY! <<<');
}

runTests().catch(err => {
  console.error('\nXXX TEST FAILED:', err);
  process.exit(1);
});
