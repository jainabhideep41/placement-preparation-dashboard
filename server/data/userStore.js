/**
 * In-Memory User Store for Unified Multi-Provider Authentication
 * Users are indexed strictly by lowercase email to ensure unified accounts across Google, GitHub, and Password.
 */

const usersByEmail = new Map();

/**
 * Normalizes email for consistent lookup
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Get user by email
 */
export function getUserByEmail(email) {
  const key = normalizeEmail(email);
  return usersByEmail.get(key) || null;
}

/**
 * Save or merge user account by email
 * Guarantees unified single-account per email across all auth providers
 */
export function saveOrMergeUser(userData) {
  const emailKey = normalizeEmail(userData.email);
  if (!emailKey) return null;

  const existing = usersByEmail.get(emailKey);

  if (existing) {
    // Merge existing user
    const updatedProviders = Array.from(new Set([
      ...(existing.providers || [existing.provider || 'email']),
      userData.provider || 'email'
    ]));

    const mergedUser = {
      ...existing,
      name: userData.name || existing.name,
      avatarUrl: userData.avatarUrl || existing.avatarUrl,
      targetRole: userData.targetRole || existing.targetRole || 'Software Development Engineer (SDE-1)',
      providers: updatedProviders,
      provider: userData.provider || existing.provider,
      password: userData.password || existing.password || null,
      emailVerified: userData.emailVerified ?? existing.emailVerified ?? false,
      welcomeEmailSent: userData.welcomeEmailSent ?? existing.welcomeEmailSent ?? false,
      handles: {
        leetcode: userData.handles?.leetcode || existing.handles?.leetcode || '',
        codeforces: userData.handles?.codeforces || existing.handles?.codeforces || '',
        github: userData.handles?.github || existing.handles?.github || ''
      },
      onboardingCompleted: existing.onboardingCompleted ?? Boolean(
        existing.handles?.leetcode || existing.handles?.codeforces || existing.handles?.github
      ),
      lastLoginAt: new Date().toISOString()
    };

    usersByEmail.set(emailKey, mergedUser);
    return mergedUser;
  }

  // Create new user record
  const newUser = {
    id: userData.id || `usr_${Date.now()}`,
    email: emailKey,
    name: userData.name || emailKey.split('@')[0],
    password: userData.password || null,
    emailVerified: userData.emailVerified || (userData.provider === 'google' || userData.provider === 'github'),
    welcomeEmailSent: userData.welcomeEmailSent || false,
    avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || emailKey.split('@')[0])}&background=111&color=fff`,
    targetRole: userData.targetRole || 'Software Development Engineer (SDE-1)',
    providers: [userData.provider || 'email'],
    provider: userData.provider || 'email',
    handles: {
      leetcode: userData.handles?.leetcode || '',
      codeforces: userData.handles?.codeforces || '',
      github: userData.handles?.github || ''
    },
    onboardingCompleted: userData.onboardingCompleted || false,
    registeredAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  usersByEmail.set(emailKey, newUser);
  return newUser;
}

/**
 * Update user password
 */
export function updateUserPassword(email, newPassword) {
  const key = normalizeEmail(email);
  const user = usersByEmail.get(key);
  if (!user) return null;

  user.password = newPassword;
  user.lastPasswordResetAt = new Date().toISOString();
  usersByEmail.set(key, user);
  return user;
}

/**
 * Mark welcome email as sent
 */
export function markWelcomeEmailSent(email) {
  const key = normalizeEmail(email);
  const user = usersByEmail.get(key);
  if (user) {
    user.welcomeEmailSent = true;
    usersByEmail.set(key, user);
  }
}

/**
 * Mark email as verified
 */
export function markEmailVerified(email) {
  const key = normalizeEmail(email);
  const user = usersByEmail.get(key);
  if (user) {
    user.emailVerified = true;
    usersByEmail.set(key, user);
    return user;
  }
  return null;
}

/**
 * Complete onboarding for a user
 */
export function completeUserOnboarding(email, handles = {}, targetRole) {
  const key = normalizeEmail(email);
  const user = usersByEmail.get(key);
  if (!user) return null;

  user.handles = {
    leetcode: handles.leetcode?.trim() ?? user.handles.leetcode,
    codeforces: handles.codeforces?.trim() ?? user.handles.codeforces,
    github: handles.github?.trim() ?? user.handles.github
  };
  if (targetRole) user.targetRole = targetRole;
  user.onboardingCompleted = true;
  user.lastLoginAt = new Date().toISOString();

  usersByEmail.set(key, user);
  return user;
}
