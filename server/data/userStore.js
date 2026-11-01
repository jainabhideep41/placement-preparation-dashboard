/**
 * Persistent User Store for Unified Multi-Provider Authentication
 * Users are indexed strictly by lowercase email to ensure unified accounts across Google, GitHub, and Password.
 * Persists to disk (/tmp in serverless environments, local root in dev).
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const usersByEmail = new Map();

// Determine writable file path (/tmp on Vercel AWS Lambda, system temp in development to prevent watch restarts)
const STORAGE_FILE = path.join(os.tmpdir(), 'prepstack_users.json');

function loadUsersFromDisk() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const u of data) {
          if (u && u.email) {
            usersByEmail.set(normalizeEmail(u.email), u);
          }
        }
      }
    }
  } catch (e) {
    // Non-blocking fallback
  }
}

function persistUsersToDisk() {
  try {
    const list = Array.from(usersByEmail.values());
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    // Non-blocking fallback
  }
}

// Initial hydration from disk
loadUsersFromDisk();

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
  if (!usersByEmail.has(key)) {
    loadUsersFromDisk();
  }
  return usersByEmail.get(key) || null;
}

/**
 * Find user by any identifier: email, id, name, or connected coding handles
 */
export function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  loadUsersFromDisk();
  const rawId = identifier.trim().toLowerCase();

  // 1. Direct email lookup
  if (usersByEmail.has(rawId)) {
    return usersByEmail.get(rawId);
  }

  // 2. Loop through users: match username first, then handles, name, email prefix
  for (const user of usersByEmail.values()) {
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

/**
 * Save or merge user account by email
 * Guarantees unified single-account per email across all auth providers
 */
export function saveOrMergeUser(userData) {
  const emailKey = normalizeEmail(userData.email);
  if (!emailKey) return null;

  loadUsersFromDisk();
  const existing = usersByEmail.get(emailKey);
  const defaultUsername = (userData.username || existing?.username || emailKey.split('@')[0]).replace(/[^a-z0-9_-]/gi, '').toLowerCase();

  if (existing) {
    // Merge existing user
    const updatedProviders = Array.from(new Set([
      ...(existing.providers || [existing.provider || 'email']),
      userData.provider || 'email'
    ]));

    const isExplicit = Boolean(userData.isExplicitUpdate);

    const mergedUser = {
      ...existing,
      username: (isExplicit ? userData.username : null) || existing.username || userData.username || defaultUsername,
      name: (isExplicit ? userData.name : null) || existing.name || userData.name,
      avatarUrl: userData.avatarUrl || existing.avatarUrl,
      phone: userData.phone !== undefined ? userData.phone : (existing.phone ?? existing.academic?.phone ?? ''),
      privacy: {
        showEmail: userData.privacy?.showEmail !== undefined ? Boolean(userData.privacy.showEmail) : (existing.privacy?.showEmail !== undefined ? Boolean(existing.privacy.showEmail) : true),
        showPhone: userData.privacy?.showPhone !== undefined ? Boolean(userData.privacy.showPhone) : (existing.privacy?.showPhone !== undefined ? Boolean(existing.privacy.showPhone) : false)
      },
      targetRole: (isExplicit ? userData.targetRole : null) || existing.targetRole || userData.targetRole || 'Software Development Engineer (SDE-1)',
      academic: {
        college: (isExplicit ? userData.academic?.college : null) ?? existing.academic?.college ?? userData.academic?.college ?? 'Chandigarh University',
        degree: (isExplicit ? userData.academic?.degree : null) ?? existing.academic?.degree ?? userData.academic?.degree ?? 'B.Tech Computer Science & Engineering',
        branch: (isExplicit ? userData.academic?.branch : null) ?? existing.academic?.branch ?? userData.academic?.branch ?? 'Computer Science',
        year: (isExplicit ? userData.academic?.year : null) ?? existing.academic?.year ?? userData.academic?.year ?? '2026 (Final Year)',
        cgpa: (isExplicit ? userData.academic?.cgpa : null) ?? existing.academic?.cgpa ?? userData.academic?.cgpa ?? '8.85 / 10',
        desiredOption: (isExplicit ? userData.academic?.desiredOption : null) ?? existing.academic?.desiredOption ?? userData.academic?.desiredOption ?? (existing.targetRole || userData.targetRole || 'Software Development Engineer (SDE-1)'),
        dreamCompanies: (isExplicit ? userData.academic?.dreamCompanies : null) ?? existing.academic?.dreamCompanies ?? userData.academic?.dreamCompanies ?? 'Google, Microsoft, Uber, Atlassian',
        workMode: (isExplicit ? userData.academic?.workMode : null) ?? existing.academic?.workMode ?? userData.academic?.workMode ?? 'Hybrid / Remote / On-site'
      },
      providers: updatedProviders,
      provider: userData.provider || existing.provider,
      password: userData.password || existing.password || null,
      emailVerified: userData.emailVerified ?? existing.emailVerified ?? false,
      welcomeEmailSent: userData.welcomeEmailSent ?? existing.welcomeEmailSent ?? false,
      handles: {
        leetcode: (isExplicit && userData.handles?.leetcode !== undefined ? userData.handles.leetcode : (existing.handles?.leetcode || userData.handles?.leetcode || '')),
        codeforces: (isExplicit && userData.handles?.codeforces !== undefined ? userData.handles.codeforces : (existing.handles?.codeforces || userData.handles?.codeforces || '')),
        github: (isExplicit && userData.handles?.github !== undefined ? userData.handles.github : (existing.handles?.github || userData.handles?.github || ''))
      },
      onboardingCompleted: existing.onboardingCompleted ?? Boolean(
        existing.handles?.leetcode || existing.handles?.codeforces || existing.handles?.github
      ),
      lastLoginAt: new Date().toISOString()
    };

    usersByEmail.set(emailKey, mergedUser);
    persistUsersToDisk();
    return mergedUser;
  }

  // Create new user record
  const newUser = {
    id: userData.id || `usr_${Date.now()}`,
    email: emailKey,
    username: defaultUsername,
    name: userData.name || emailKey.split('@')[0],
    phone: userData.phone || userData.academic?.phone || '',
    privacy: {
      showEmail: userData.privacy?.showEmail !== undefined ? Boolean(userData.privacy.showEmail) : true,
      showPhone: userData.privacy?.showPhone !== undefined ? Boolean(userData.privacy.showPhone) : false
    },
    password: userData.password || null,
    emailVerified: userData.emailVerified || (userData.provider === 'google' || userData.provider === 'github'),
    welcomeEmailSent: userData.welcomeEmailSent || false,
    avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || emailKey.split('@')[0])}&background=111&color=fff`,
    targetRole: userData.targetRole || 'Software Development Engineer (SDE-1)',
    academic: {
      college: userData.academic?.college || 'Chandigarh University',
      degree: userData.academic?.degree || 'B.Tech Computer Science & Engineering',
      branch: userData.academic?.branch || 'Computer Science',
      year: userData.academic?.year || '2026 (Final Year)',
      cgpa: userData.academic?.cgpa || '8.85 / 10',
      desiredOption: userData.academic?.desiredOption || (userData.targetRole || 'Software Development Engineer (SDE-1)'),
      dreamCompanies: userData.academic?.dreamCompanies || 'Google, Microsoft, Uber, Atlassian',
      workMode: userData.academic?.workMode || 'Hybrid / Remote / On-site'
    },
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
  persistUsersToDisk();
  return newUser;
}

/**
 * Update user profile details including public username, academic details, and target role
 */
export function updateUserProfile(email, profileData = {}) {
  const key = normalizeEmail(email);
  loadUsersFromDisk();
  let user = usersByEmail.get(key);
  if (!user) {
    user = saveOrMergeUser({ email: key, ...profileData });
  }

  if (profileData.username) {
    const cleanUsername = profileData.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername) {
      for (const [otherEmail, otherUser] of usersByEmail.entries()) {
        if (otherEmail !== key && otherUser.username?.toLowerCase() === cleanUsername) {
          throw new Error(`Username "${cleanUsername}" is already taken by another candidate.`);
        }
      }
      user.username = cleanUsername;
    }
  }

  if (profileData.name) user.name = profileData.name.trim();
  if (profileData.targetRole) user.targetRole = profileData.targetRole.trim();
  if (profileData.avatarUrl) user.avatarUrl = profileData.avatarUrl.trim();
  if (profileData.phone !== undefined) user.phone = profileData.phone.trim();
  if (profileData.privacy) {
    user.privacy = {
      showEmail: profileData.privacy.showEmail !== undefined ? Boolean(profileData.privacy.showEmail) : (user.privacy?.showEmail ?? true),
      showPhone: profileData.privacy.showPhone !== undefined ? Boolean(profileData.privacy.showPhone) : (user.privacy?.showPhone ?? false)
    };
  }
  if (profileData.handles) {
    user.handles = {
      leetcode: profileData.handles.leetcode !== undefined ? profileData.handles.leetcode.trim() : (user.handles?.leetcode || ''),
      codeforces: profileData.handles.codeforces !== undefined ? profileData.handles.codeforces.trim() : (user.handles?.codeforces || ''),
      github: profileData.handles.github !== undefined ? profileData.handles.github.trim() : (user.handles?.github || '')
    };
  }
  if (profileData.academic) {
    user.academic = {
      ...user.academic,
      ...profileData.academic
    };
  }
  user.updatedAt = new Date().toISOString();

  usersByEmail.set(key, user);
  persistUsersToDisk();
  return user;
}

/**
 * Update user password
 */
export function updateUserPassword(email, newPassword) {
  const key = normalizeEmail(email);
  loadUsersFromDisk();
  const user = usersByEmail.get(key);
  if (!user) return null;

  user.password = newPassword;
  user.lastPasswordResetAt = new Date().toISOString();
  usersByEmail.set(key, user);
  persistUsersToDisk();
  return user;
}

/**
 * Mark welcome email as sent
 */
export function markWelcomeEmailSent(email) {
  const key = normalizeEmail(email);
  loadUsersFromDisk();
  const user = usersByEmail.get(key);
  if (user) {
    user.welcomeEmailSent = true;
    usersByEmail.set(key, user);
    persistUsersToDisk();
  }
}

/**
 * Mark email as verified
 */
export function markEmailVerified(email) {
  const key = normalizeEmail(email);
  loadUsersFromDisk();
  const user = usersByEmail.get(key);
  if (user) {
    user.emailVerified = true;
    usersByEmail.set(key, user);
    persistUsersToDisk();
    return user;
  }
  return null;
}

/**
 * Complete onboarding for a user
 */
export function completeUserOnboarding(email, handles = {}, targetRole) {
  const key = normalizeEmail(email);
  loadUsersFromDisk();
  let user = usersByEmail.get(key);
  if (!user) {
    user = saveOrMergeUser({
      email: key,
      handles: {
        leetcode: handles.leetcode?.trim() || '',
        codeforces: handles.codeforces?.trim() || '',
        github: handles.github?.trim() || ''
      },
      targetRole: targetRole || 'Software Development Engineer (SDE-1)'
    });
  } else {
    user.handles = {
      leetcode: handles.leetcode !== undefined ? handles.leetcode.trim() : (user.handles?.leetcode || ''),
      codeforces: handles.codeforces !== undefined ? handles.codeforces.trim() : (user.handles?.codeforces || ''),
      github: handles.github !== undefined ? handles.github.trim() : (user.handles?.github || '')
    };
    if (targetRole) user.targetRole = targetRole;
    user.onboardingCompleted = true;
    user.lastLoginAt = new Date().toISOString();
    usersByEmail.set(key, user);
    persistUsersToDisk();
  }
  return user;
}
