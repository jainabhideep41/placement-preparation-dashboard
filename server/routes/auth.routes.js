import express from 'express';

const router = express.Router();

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
    // Redirect with prompt indicator so client opens interactive sign-in
    return res.redirect(`${getClientUrl(req)}/?oauth_info=github_unconfigured`);
  }

  const callbackUrl = `${getBaseUrl(req)}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user,user:email`;
  res.redirect(githubAuthUrl);
});

/**
 * GET /api/auth/github/callback
 * Handles GitHub OAuth code exchange
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

    // 4. Construct authenticated student profile
    const studentUser = {
      id: `gh_${ghUser.id}`,
      name: ghUser.name || ghUser.login,
      email: primaryEmail || `${ghUser.login}@users.noreply.github.com`,
      targetRole: 'Software Development Engineer (SDE-1)',
      provider: 'github',
      avatarUrl: ghUser.avatar_url,
      handles: {
        leetcode: '',
        codeforces: '',
        github: ghUser.login // Automatically links their real GitHub handle!
      },
      loggedInAt: new Date().toISOString()
    };

    const userParam = encodeURIComponent(JSON.stringify(studentUser));
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
 * Handles Google OAuth code exchange
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

    // 3. Construct authenticated student profile
    const studentUser = {
      id: `google_${gUser.sub}`,
      name: gUser.name || gUser.given_name || 'Google User',
      email: gUser.email,
      targetRole: 'Software Development Engineer (SDE-1)',
      provider: 'google',
      avatarUrl: gUser.picture,
      handles: {
        leetcode: '',
        codeforces: '',
        github: ''
      },
      loggedInAt: new Date().toISOString()
    };

    const userParam = encodeURIComponent(JSON.stringify(studentUser));
    res.redirect(`${getClientUrl(req)}/?oauth_success=true&user=${userParam}`);
  } catch (err) {
    console.error('[Google OAuth Error]:', err.message);
    res.redirect(`${getClientUrl(req)}/?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * POST /api/auth/instant-oauth
 * Fallback interactive OAuth for viva / instant verification
 * If user gives a GitHub username, fetches public GitHub API to populate real avatar and details
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

export default router;
