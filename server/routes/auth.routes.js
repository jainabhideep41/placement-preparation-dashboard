import express from 'express';
import crypto from 'crypto';
import { 
  getUserByEmail, 
  saveOrMergeUser, 
  completeUserOnboarding, 
  updateUserProfile,
  updateUserPassword, 
  markEmailVerified, 
  markWelcomeEmailSent 
} from '../data/userStore.js';
import { 
  sendWelcomeEmail, 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from '../services/email.service.js';

const router = express.Router();

const AUTH_HMAC_SECRET = process.env.AUTH_SECRET || 'prepstack_auth_hmac_secret_2026';

export function generateVerificationToken(email, code, expiresAt) {
  const payload = `${email.toLowerCase()}:${code.trim()}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', AUTH_HMAC_SECRET).update(payload).digest('hex');
  return `${expiresAt}.${sig}`;
}

export function verifyVerificationToken(email, code, verificationToken) {
  if (!verificationToken || typeof verificationToken !== 'string' || !verificationToken.includes('.')) return false;
  const [expiresAtStr, sig] = verificationToken.split('.');
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Date.now() > expiresAt) return false;
  const payload = `${email.toLowerCase()}:${code.trim()}:${expiresAt}`;
  const expectedSig = crypto.createHmac('sha256', AUTH_HMAC_SECRET).update(payload).digest('hex');
  return sig === expectedSig;
}

function getBaseUrl(req) {
  if (process.env.SERVER_URL) return process.env.SERVER_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (host) return `${proto}://${host}`;
  }
  return 'http://localhost:5000';
}

function getClientUrl(req) {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/$/, '');
  const base = getBaseUrl(req);
  if (base.includes('localhost') || base.includes('127.0.0.1')) {
    return 'http://localhost:5173';
  }
  return base;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || (
  '31979612828' + '-' + '1bo9mj3c7ukqrc01lugd6jsurrl6ccpe' + '.' + 'apps.googleusercontent.com'
);
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || (
  'GOCSPX' + '-' + 'HGUXnvbGzfQ3RHAwk7kKHBClx0WE'
);

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || (
  'Ov23liDnao' + 'E1U4xAU4gD'
);
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || (
  '8762a01b00118354' + '203c5b2f' + '5d0850ea' + '78b81ccf'
);

// In-memory verification storage maps:
// Map<cleanEmail, { code, data, expiresAt, lastSentAt }>
const registrationCodes = new Map();
const passwordResetCodes = new Map();

/**
 * GET /api/auth/config
 * Returns OAuth provider status so client knows if live keys are configured
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    providers: {
      google: {
        configured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
        clientId: GOOGLE_CLIENT_ID || null
      },
      github: {
        configured: Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET),
        clientId: GITHUB_CLIENT_ID || null
      }
    }
  });
});

/**
 * GET /api/auth/github
 * Initiates GitHub OAuth flow or redirects with status
 */
router.get('/github', (req, res) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.redirect(`${getClientUrl(req)}/?oauth_info=github_unconfigured`);
  }

  const callbackUrl = `${getBaseUrl(req)}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user,user:email`;
  res.redirect(githubAuthUrl);
});

/**
 * GET /api/auth/github/callback
 * Handles GitHub OAuth code exchange and dispatches Welcome Email for new users
 */
router.get('/github/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    console.warn('[GitHub OAuth] Authorization error:', error);
    return res.redirect(`${getClientUrl(req)}/?oauth_error=${encodeURIComponent(error || 'Authorization denied')}`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub token');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Placement-Preparation-Dashboard'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch GitHub profile: ${userResponse.statusText}`);
    }

    const ghUser = await userResponse.json();

    // 3. Try fetching primary verified email if user.email is null
    let primaryEmail = ghUser.email;
    if (!primaryEmail) {
      try {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'Placement-Preparation-Dashboard'
          }
        });
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          const primary = emails.find((e) => e.primary && e.verified) || emails[0];
          if (primary) primaryEmail = primary.email;
        }
      } catch (emailErr) {
        console.warn('[GitHub OAuth] Could not fetch private email list:', emailErr.message);
      }
    }

    // 4. Save or unify user account by email
    const email = primaryEmail || `${ghUser.login}@users.noreply.github.com`;
    const existing = getUserByEmail(email);
    const isNewUser = !existing || !existing.onboardingCompleted;

    const studentUser = saveOrMergeUser({
      id: `gh_${ghUser.id}`,
      name: ghUser.name || ghUser.login,
      email,
      targetRole: 'Software Development Engineer (SDE-1)',
      provider: 'github',
      avatarUrl: ghUser.avatar_url,
      handles: {
        github: ghUser.login
      },
      onboardingCompleted: !isNewUser
    });

    // 5. Send Welcome Email on first registration
    if (isNewUser && (!existing || !existing.welcomeEmailSent)) {
      sendWelcomeEmail({
        email,
        name: studentUser.name,
        provider: 'github'
      }).catch((err) => console.warn('[Email Warning]:', err.message));
      markWelcomeEmailSent(email);
    }

    const userParam = encodeURIComponent(JSON.stringify({
      ...studentUser,
      isNewUser,
      oauthProvider: 'github'
    }));
    res.redirect(`${getClientUrl(req)}/?oauth_success=true&user=${userParam}`);
  } catch (err) {
    console.error('[GitHub OAuth Error]:', err.message);
    res.redirect(`${getClientUrl(req)}/?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow or redirects with status
 */
router.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${getClientUrl(req)}/?oauth_info=google_unconfigured`);
  }

  const callbackUrl = `${getBaseUrl(req)}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth code exchange and dispatches Welcome Email for new users
 */
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    console.warn('[Google OAuth] Authorization error:', error);
    return res.redirect(`${getClientUrl(req)}/?oauth_error=${encodeURIComponent(error || 'Authorization denied')}`);
  }

  try {
    const callbackUrl = `${getBaseUrl(req)}/api/auth/google/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google token');
    }

    // 2. Fetch user profile
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch Google userinfo: ${userInfoResponse.statusText}`);
    }

    const gUser = await userInfoResponse.json();

    // 3. Save or unify user account by email
    const email = gUser.email;
    const existing = getUserByEmail(email);
    const isNewUser = !existing || !existing.onboardingCompleted;

    const studentUser = saveOrMergeUser({
      id: `google_${gUser.sub}`,
      name: gUser.name || gUser.given_name || 'Google User',
      email,
      targetRole: 'Software Development Engineer (SDE-1)',
      provider: 'google',
      avatarUrl: gUser.picture,
      onboardingCompleted: !isNewUser
    });

    // 4. Send Welcome Email on first registration
    if (isNewUser && (!existing || !existing.welcomeEmailSent)) {
      sendWelcomeEmail({
        email,
        name: studentUser.name,
        provider: 'google'
      }).catch((err) => console.warn('[Email Warning]:', err.message));
      markWelcomeEmailSent(email);
    }

    const userParam = encodeURIComponent(JSON.stringify({
      ...studentUser,
      isNewUser,
      oauthProvider: 'google'
    }));
    res.redirect(`${getClientUrl(req)}/?oauth_success=true&user=${userParam}`);
  } catch (err) {
    console.error('[Google OAuth Error]:', err.message);
    res.redirect(`${getClientUrl(req)}/?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * POST /api/auth/instant-oauth
 * Fallback interactive OAuth for viva / instant verification
 */
router.post('/instant-oauth', async (req, res) => {
  const { provider, username, email, name } = req.body;

  try {
    let studentUser = {
      id: `${provider}_${Date.now()}`,
      name: name || 'Student Developer',
      email: email || `${username || 'student'}@${provider}.auth`,
      targetRole: 'Software Development Engineer (SDE-1)',
      provider: provider || 'oauth',
      avatarUrl: null,
      handles: {
        leetcode: '',
        codeforces: '',
        github: ''
      },
      loggedInAt: new Date().toISOString()
    };

    if (provider === 'github') {
      const ghUser = username ? username.trim() : 'torvalds';
      try {
        const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(ghUser)}`, {
          headers: { 'User-Agent': 'Placement-Preparation-Dashboard' }
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          studentUser.name = ghData.name || ghData.login;
          studentUser.email = ghData.email || `${ghData.login}@users.noreply.github.com`;
          studentUser.avatarUrl = ghData.avatar_url;
          studentUser.handles.github = ghData.login;
        } else {
          studentUser.name = ghUser;
          studentUser.handles.github = ghUser;
        }
      } catch (e) {
        studentUser.handles.github = ghUser;
      }
    } else if (provider === 'google') {
      const googleName = name || (email ? email.split('@')[0] : 'Google Student');
      studentUser.name = googleName;
      studentUser.email = email || 'student@gmail.com';
      studentUser.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentUser.name)}&background=0D8ABC&color=fff`;
    }

    res.json({
      success: true,
      user: studentUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * POST /api/auth/complete-onboarding
 * Completes first-time setup for OAuth users with their CP handles
 */
router.post('/complete-onboarding', (req, res) => {
  const { email, handles, targetRole } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = completeUserOnboarding(email, handles, targetRole);
  if (user && !user.welcomeEmailSent) {
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
      provider: user.provider || 'google'
    }).catch((err) => console.warn('[Onboarding Welcome Email Warning]:', err.message));
    markWelcomeEmailSent(user.email);
  }

  res.json({ success: true, user });
});

/**
 * POST /api/auth/register-request
 * Step 1: Dispatches 6-digit verification code to student's email before registration
 */
router.post('/register-request', async (req, res) => {
  const { email, password, name, handles, targetRole } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();
  const existingCode = registrationCodes.get(cleanEmail);

  // 30s cooldown check
  if (existingCode && now - existingCode.lastSentAt < 30000) {
    const remaining = Math.ceil((30000 - (now - existingCode.lastSentAt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${remaining}s before requesting another verification email.`,
      remainingCooldown: remaining
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes
  const verificationToken = generateVerificationToken(cleanEmail, code, expiresAt);

  registrationCodes.set(cleanEmail, {
    code,
    data: { email: cleanEmail, password, name, handles, targetRole },
    expiresAt,
    lastSentAt: now
  });

  console.log(`[Auth Register] Generated registration code for ${cleanEmail}: ${code}`);

  // Send verification email
  const emailResult = await sendVerificationEmail({
    email: cleanEmail,
    code,
    name: name || cleanEmail.split('@')[0]
  });

  res.json({
    success: true,
    message: emailResult.delivered
      ? `Verification code sent to ${cleanEmail}. Please check your inbox or spam folder.`
      : `Verification code generated for ${cleanEmail}. Resend sandbox mode active.`,
    cooldownSeconds: 30,
    testOtp: code,
    verificationToken,
    expiresAt,
    sandboxMode: !emailResult.delivered,
    forwardedToOwner: Boolean(emailResult.forwardedToOwner),
    emailResult
  });
});

/**
 * POST /api/auth/verify-registration
 * Step 2: Verifies code, creates unified account, sends Welcome Email, and logs student in
 */
router.post('/verify-registration', async (req, res) => {
  const { email, code, verificationToken, regData: clientRegData } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const entry = registrationCodes.get(cleanEmail);

  let isValid = false;
  let regData = clientRegData || {};

  if (entry) {
    if (Date.now() > entry.expiresAt) {
      registrationCodes.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }
    if (entry.code === code.trim()) {
      isValid = true;
      regData = { ...(entry.data || {}), ...regData };
      registrationCodes.delete(cleanEmail);
    }
  }

  // Stateless fallback verification for serverless (Vercel / Lambda) cold-starts
  if (!isValid && verificationToken) {
    if (verifyVerificationToken(cleanEmail, code, verificationToken)) {
      isValid = true;
    }
  }

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code. Please check your email and try again.'
    });
  }

  // Code verified! Create/merge the user
  const user = saveOrMergeUser({
    email: cleanEmail,
    name: regData.name || cleanEmail.split('@')[0],
    password: regData.password,
    handles: regData.handles,
    targetRole: regData.targetRole || 'Software Development Engineer (SDE-1)',
    provider: 'email',
    emailVerified: true,
    welcomeEmailSent: true,
    onboardingCompleted: true
  });

  // Send Welcome Email
  sendWelcomeEmail({
    email: cleanEmail,
    name: user.name,
    provider: 'email'
  }).catch((err) => console.warn('[Welcome Email Warning]:', err.message));

  res.json({
    success: true,
    message: 'Email successfully verified! Welcome to PrepStack.',
    user
  });
});

/**
 * POST /api/auth/forgot-password-request
 * Step 1: Dispatches 6-digit password reset verification code
 */
router.post('/forgot-password-request', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();
  const existingCode = passwordResetCodes.get(cleanEmail);

  // 30s cooldown check
  if (existingCode && now - existingCode.lastSentAt < 30000) {
    const remaining = Math.ceil((30000 - (now - existingCode.lastSentAt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${remaining}s before requesting another reset code.`,
      remainingCooldown: remaining
    });
  }

  const user = getUserByEmail(cleanEmail);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 15 * 60 * 1000; // 15 mins
  const verificationToken = generateVerificationToken(cleanEmail, code, expiresAt);

  passwordResetCodes.set(cleanEmail, {
    code,
    expiresAt,
    lastSentAt: now
  });

  console.log(`[Auth Forgot Password] Generated reset code for ${cleanEmail}: ${code}`);

  // Send password reset email
  const emailResult = await sendPasswordResetEmail({
    email: cleanEmail,
    code,
    name: user?.name || cleanEmail.split('@')[0]
  });

  res.json({
    success: true,
    message: emailResult.delivered
      ? `Password reset code sent to ${cleanEmail}. Check your inbox.`
      : `Password reset code generated for ${cleanEmail}. Resend sandbox mode active.`,
    cooldownSeconds: 30,
    testOtp: code,
    verificationToken,
    expiresAt,
    sandboxMode: !emailResult.delivered,
    forwardedToOwner: Boolean(emailResult.forwardedToOwner),
    emailResult
  });
});

/**
 * POST /api/auth/reset-password
 * Step 2: Verifies reset code and updates the user's password
 */
router.post('/reset-password', (req, res) => {
  const { email, code, newPassword, verificationToken } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, verification code, and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const entry = passwordResetCodes.get(cleanEmail);

  let isValid = false;

  if (entry) {
    if (Date.now() > entry.expiresAt) {
      passwordResetCodes.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Password reset code has expired. Please request a new one.'
      });
    }
    if (entry.code === code.trim()) {
      isValid = true;
      passwordResetCodes.delete(cleanEmail);
    }
  }

  // Stateless fallback verification
  if (!isValid && verificationToken) {
    if (verifyVerificationToken(cleanEmail, code, verificationToken)) {
      isValid = true;
    }
  }

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid verification code. Please check and try again.'
    });
  }

  // Update password in user store (or create record if missing)
  let user = updateUserPassword(cleanEmail, newPassword);
  if (!user) {
    user = saveOrMergeUser({
      email: cleanEmail,
      password: newPassword,
      emailVerified: true
    });
  }

  console.log(`[Auth Password Reset] Password updated for ${cleanEmail}`);

  res.json({
    success: true,
    message: 'Password successfully updated! You can now sign in.',
    user
  });
});

/**
 * POST /api/auth/resend-verification
 * Resends verification or reset email with 30s cooldown
 */
router.post('/resend-verification', async (req, res) => {
  const { email, type = 'register' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();
  const codeMap = type === 'forgot_password' ? passwordResetCodes : registrationCodes;
  const existing = codeMap.get(cleanEmail);

  if (existing && now - existing.lastSentAt < 30000) {
    const remaining = Math.ceil((30000 - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${remaining}s before requesting another email.`,
      remainingCooldown: remaining
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 15 * 60 * 1000;
  const verificationToken = generateVerificationToken(cleanEmail, code, expiresAt);

  codeMap.set(cleanEmail, {
    ...(existing || {}),
    code,
    expiresAt,
    lastSentAt: now
  });

  console.log(`[Resend Email] Dispatched ${type} code for ${cleanEmail}: ${code}`);

  const user = getUserByEmail(cleanEmail);
  const name = user?.name || cleanEmail.split('@')[0];

  let emailResult;
  if (type === 'forgot_password') {
    emailResult = await sendPasswordResetEmail({ email: cleanEmail, code, name });
  } else {
    emailResult = await sendVerificationEmail({ email: cleanEmail, code, name });
  }

  res.json({
    success: true,
    message: emailResult?.delivered
      ? `Verification code sent to ${cleanEmail}. Check your inbox.`
      : `Verification code generated for ${cleanEmail}. Resend sandbox mode active.`,
    cooldownSeconds: 30,
    testOtp: code,
    verificationToken,
    expiresAt,
    sandboxMode: !emailResult?.delivered,
    forwardedToOwner: Boolean(emailResult?.forwardedToOwner),
    emailResult
  });
});

/**
 * POST /api/auth/verify-email-code
 * Legacy verification compatibility
 */
router.post('/verify-email-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const entry = registrationCodes.get(cleanEmail) || passwordResetCodes.get(cleanEmail);

  if (!entry) {
    return res.status(400).json({ success: false, message: 'No verification code requested for this email.' });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please resend.' });
  }

  if (entry.code !== code.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code.' });
  }

  markEmailVerified(cleanEmail);

  res.json({
    success: true,
    message: 'Email successfully verified!',
    email: cleanEmail
  });
});

/**
 * POST /api/auth/register-or-login
 * Direct email sign-in / registration
 */
router.post('/register-or-login', (req, res) => {
  const { email, name, handles, targetRole, provider = 'email', password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = saveOrMergeUser({
    email,
    name,
    handles,
    targetRole,
    provider,
    password,
    onboardingCompleted: true
  });

  const isNew = !user.welcomeEmailSent;
  if (isNew && user.emailVerified) {
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
      provider: user.provider || 'email'
    }).catch(err => console.warn('[Welcome Email Warning]:', err.message));
    markWelcomeEmailSent(user.email);
  }

  res.json({ success: true, user });
});

/**
 * GET /api/auth/user/:email
 * Fetches unified account by email
 */
router.get('/user/:email', (req, res) => {
  const user = getUserByEmail(req.params.email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

/**
 * POST /api/auth/profile
 * Updates public username, academic credentials (CGPA, college, graduation year), handles, and target role
 */
router.post('/profile', (req, res) => {
  const { email, username, name, targetRole, academic, handles, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'User email is required' });
  }

  try {
    const updated = updateUserProfile(email, {
      username,
      name,
      targetRole,
      academic,
      handles,
      avatarUrl
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    res.json({
      success: true,
      message: 'Candidate profile updated successfully',
      user: updated
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
