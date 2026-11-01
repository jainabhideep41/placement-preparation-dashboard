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

export function saveUserToRegistry(user, isExplicitUpdate = false) {
  if (!user || !user.email) return user;
  const emailKey = normalizeEmail(user.email);
  const users = getRegisteredUsers();
  const existing = users[emailKey];

  const updatedProviders = Array.from(new Set([
    ...(existing?.providers || (existing?.provider ? [existing.provider] : [])),
    user.provider || 'email'
  ]));

  const defaultUsername = (existing?.username || user.username || emailKey.split('@')[0]).replace(/[^a-z0-9_-]/gi, '').toLowerCase();

  const merged = {
    id: existing?.id || user.id || `usr_${Date.now()}`,
    email: emailKey,
    username: isExplicitUpdate 
      ? (user.username || existing?.username || defaultUsername)
      : (existing?.username || user.username || defaultUsername),
    name: isExplicitUpdate 
      ? (user.name || existing?.name || emailKey.split('@')[0])
      : (existing?.name || user.name || emailKey.split('@')[0]),
    avatarUrl: existing?.avatarUrl || user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || emailKey.split('@')[0])}&background=111&color=fff`,
    phone: isExplicitUpdate
      ? (user.phone !== undefined ? user.phone : (existing?.phone || ''))
      : (existing?.phone || user.phone || existing?.academic?.phone || ''),
    privacy: {
      showEmail: isExplicitUpdate
        ? (user.privacy?.showEmail !== undefined ? Boolean(user.privacy.showEmail) : (existing?.privacy?.showEmail !== undefined ? Boolean(existing.privacy.showEmail) : true))
        : (existing?.privacy?.showEmail !== undefined ? Boolean(existing.privacy.showEmail) : (user.privacy?.showEmail !== undefined ? Boolean(user.privacy.showEmail) : true)),
      showPhone: isExplicitUpdate
        ? (user.privacy?.showPhone !== undefined ? Boolean(user.privacy.showPhone) : (existing?.privacy?.showPhone !== undefined ? Boolean(existing.privacy.showPhone) : false))
        : (existing?.privacy?.showPhone !== undefined ? Boolean(existing.privacy.showPhone) : (user.privacy?.showPhone !== undefined ? Boolean(user.privacy.showPhone) : false))
    },
    targetRole: isExplicitUpdate
      ? (user.targetRole || existing?.targetRole || 'Software Development Engineer (SDE-1)')
      : (existing?.targetRole || user.targetRole || 'Software Development Engineer (SDE-1)'),
    academic: isExplicitUpdate
      ? {
          college: user.academic?.college ?? existing?.academic?.college ?? 'Chandigarh University',
          degree: user.academic?.degree ?? existing?.academic?.degree ?? 'B.Tech Computer Science & Engineering',
          branch: user.academic?.branch ?? existing?.academic?.branch ?? 'Computer Science',
          year: user.academic?.year ?? existing?.academic?.year ?? '2026 (Final Year)',
          cgpa: user.academic?.cgpa ?? existing?.academic?.cgpa ?? '8.85 / 10',
          desiredOption: user.academic?.desiredOption ?? existing?.academic?.desiredOption ?? (user.targetRole || existing?.targetRole || 'Software Development Engineer (SDE-1)'),
          dreamCompanies: user.academic?.dreamCompanies ?? existing?.academic?.dreamCompanies ?? 'Google, Microsoft, Uber, Atlassian',
          workMode: user.academic?.workMode ?? existing?.academic?.workMode ?? 'Hybrid / Remote / On-site'
        }
      : {
          college: existing?.academic?.college ?? user.academic?.college ?? 'Chandigarh University',
          degree: existing?.academic?.degree ?? user.academic?.degree ?? 'B.Tech Computer Science & Engineering',
          branch: existing?.academic?.branch ?? user.academic?.branch ?? 'Computer Science',
          year: existing?.academic?.year ?? user.academic?.year ?? '2026 (Final Year)',
          cgpa: existing?.academic?.cgpa ?? user.academic?.cgpa ?? '8.85 / 10',
          desiredOption: existing?.academic?.desiredOption ?? user.academic?.desiredOption ?? (existing?.targetRole || user.targetRole || 'Software Development Engineer (SDE-1)'),
          dreamCompanies: existing?.academic?.dreamCompanies ?? user.academic?.dreamCompanies ?? 'Google, Microsoft, Uber, Atlassian',
          workMode: existing?.academic?.workMode ?? user.academic?.workMode ?? 'Hybrid / Remote / On-site'
        },
    providers: updatedProviders,
    provider: existing?.provider || user.provider || 'email',
    password: user.password || existing?.password || null,
    emailVerified: existing?.emailVerified ?? user.emailVerified ?? true,
    handles: isExplicitUpdate
      ? {
          leetcode: user.handles?.leetcode !== undefined ? user.handles.leetcode : (existing?.handles?.leetcode || ''),
          codeforces: user.handles?.codeforces !== undefined ? user.handles.codeforces : (existing?.handles?.codeforces || ''),
          github: user.handles?.github !== undefined ? user.handles.github : (existing?.handles?.github || '')
        }
      : {
          leetcode: existing?.handles?.leetcode || user.handles?.leetcode || '',
          codeforces: existing?.handles?.codeforces || user.handles?.codeforces || '',
          github: existing?.handles?.github || user.handles?.github || ''
        },
    onboardingCompleted: existing?.onboardingCompleted || user.onboardingCompleted || Boolean(
      (existing?.handles?.leetcode || user.handles?.leetcode) ||
      (existing?.handles?.codeforces || user.handles?.codeforces) ||
      (existing?.handles?.github || user.handles?.github)
    ),
    registeredAt: existing?.registeredAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  users[emailKey] = merged;
  try {
    window.localStorage.setItem('prep_registered_users', JSON.stringify(users));
    window.localStorage.setItem('prep_auth_user', JSON.stringify(merged));
    window.localStorage.setItem('prep_user_handles', JSON.stringify(merged.handles));
    window.dispatchEvent(new CustomEvent('prep_local_cache_sync', { detail: { key: 'prep_auth_user', value: merged } }));
    window.dispatchEvent(new CustomEvent('prep_local_cache_sync', { detail: { key: 'prep_user_handles', value: merged.handles } }));
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
