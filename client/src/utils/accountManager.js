/**
 * Account Manager for Unified Multi-Provider Authentication
 * Guarantees that Google, GitHub, and Password sign-ins for the same email address
 * always resolve to the exact same unified student account.
 */

export function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

export function getRegisteredUsers() {
  try {
    const raw = window.localStorage.getItem('prep_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function findUserByEmail(email) {
  const users = getRegisteredUsers();
  return users[normalizeEmail(email)] || null;
}

export function saveUserToRegistry(user) {
  if (!user || !user.email) return user;
  const emailKey = normalizeEmail(user.email);
  const users = getRegisteredUsers();
  const existing = users[emailKey];

  const updatedProviders = Array.from(new Set([
    ...(existing?.providers || (existing?.provider ? [existing.provider] : [])),
    user.provider || 'email'
  ]));

  const defaultUsername = (user.username || existing?.username || emailKey.split('@')[0]).replace(/[^a-z0-9_-]/gi, '').toLowerCase();

  const merged = {
    id: existing?.id || user.id || `usr_${Date.now()}`,
    email: emailKey,
    username: user.username || existing?.username || defaultUsername,
    name: user.name || existing?.name || emailKey.split('@')[0],
    avatarUrl: user.avatarUrl || existing?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || emailKey.split('@')[0])}&background=111&color=fff`,
    targetRole: user.targetRole || existing?.targetRole || 'Software Development Engineer (SDE-1)',
    academic: {
      college: user.academic?.college ?? existing?.academic?.college ?? 'Chandigarh University',
      degree: user.academic?.degree ?? existing?.academic?.degree ?? 'B.Tech Computer Science & Engineering',
      branch: user.academic?.branch ?? existing?.academic?.branch ?? 'Computer Science',
      year: user.academic?.year ?? existing?.academic?.year ?? '2026 (Final Year)',
      cgpa: user.academic?.cgpa ?? existing?.academic?.cgpa ?? '8.85 / 10',
      desiredOption: user.academic?.desiredOption ?? existing?.academic?.desiredOption ?? (user.targetRole || existing?.targetRole || 'Software Development Engineer (SDE-1)'),
      dreamCompanies: user.academic?.dreamCompanies ?? existing?.academic?.dreamCompanies ?? 'Google, Microsoft, Uber, Atlassian',
      workMode: user.academic?.workMode ?? existing?.academic?.workMode ?? 'Hybrid / Remote / On-site'
    },
    providers: updatedProviders,
    provider: user.provider || existing?.provider || 'email',
    password: user.password || existing?.password || null,
    emailVerified: user.emailVerified ?? existing?.emailVerified ?? (user.provider === 'google' || user.provider === 'github'),
    handles: {
      leetcode: user.handles?.leetcode !== undefined ? user.handles.leetcode : (existing?.handles?.leetcode || ''),
      codeforces: user.handles?.codeforces !== undefined ? user.handles.codeforces : (existing?.handles?.codeforces || ''),
      github: user.handles?.github !== undefined ? user.handles.github : (existing?.handles?.github || '')
    },
    onboardingCompleted: user.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
    registeredAt: existing?.registeredAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  users[emailKey] = merged;
  try {
    window.localStorage.setItem('prep_registered_users', JSON.stringify(users));
    const active = window.localStorage.getItem('prep_auth_user');
    if (active) {
      const activeObj = JSON.parse(active);
      if (activeObj?.email?.toLowerCase() === emailKey) {
        window.localStorage.setItem('prep_auth_user', JSON.stringify(merged));
      }
    }
  } catch (e) {
    console.warn('Could not persist users registry:', e);
  }

  return merged;
}

export function updateUserPasswordInRegistry(email, newPassword) {
  const emailKey = normalizeEmail(email);
  const users = getRegisteredUsers();
  const existing = users[emailKey];

  if (existing) {
    existing.password = newPassword;
    existing.lastPasswordResetAt = new Date().toISOString();
    users[emailKey] = existing;
    try {
      window.localStorage.setItem('prep_registered_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Could not persist updated password:', e);
    }
    return existing;
  }
  return null;
}

export function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const rawId = identifier.trim().toLowerCase();
  const users = getRegisteredUsers();

  // 1. Direct email match
  if (users[rawId]) return users[rawId];

  // 2. Loop values: check username first
  for (const user of Object.values(users)) {
    if (user.username?.toLowerCase() === rawId) return user;
    if (user.id?.toLowerCase() === rawId) return user;
    if (user.email?.split('@')[0]?.toLowerCase() === rawId) return user;
    if (user.name?.trim().toLowerCase() === rawId) return user;
    if (user.handles?.leetcode?.trim().toLowerCase() === rawId) return user;
    if (user.handles?.github?.trim().toLowerCase() === rawId) return user;
    if (user.handles?.codeforces?.trim().toLowerCase() === rawId) return user;
  }
  return null;
}
