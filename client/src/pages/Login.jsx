import React, { useState, useEffect, useRef, useCallback } from 'react';
import { findUserByEmail, saveUserToRegistry, updateUserPasswordInRegistry } from '../utils/accountManager';
import { 
  Terminal, 
  Code2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send,
  MailCheck,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function GitHubIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/**
 * Professional 6-digit OTP Input — Google/Stripe/GitHub style
 * Features: individual boxes, auto-advance, paste support, backspace to prev, keyboard nav
 */
function OTPInput({ value, onChange, error, autoFocus = false }) {
  const inputRefs = useRef([]);
  const digits = (value || '').split('').concat(Array(6).fill('')).slice(0, 6);

  const focusBox = useCallback((idx) => {
    const el = inputRefs.current[idx];
    if (el) { el.focus(); el.select(); }
  }, []);

  const handleKeyDown = useCallback((e, idx) => {
    if (e.key === 'Backspace') {
      if (digits[idx] !== '') {
        const next = digits.map((d, i) => i === idx ? '' : d).join('');
        onChange(next);
      } else if (idx > 0) {
        const next = digits.map((d, i) => i === idx - 1 ? '' : d).join('');
        onChange(next);
        focusBox(idx - 1);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focusBox(idx - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      focusBox(idx + 1);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      // Allow form submission via Enter on any box
    }
  }, [digits, onChange, focusBox]);

  const handleInput = useCallback((e, idx) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const char = raw[raw.length - 1]; // take last digit typed
    const next = digits.map((d, i) => i === idx ? char : d).join('');
    onChange(next);
    if (idx < 5) focusBox(idx + 1);
  }, [digits, onChange, focusBox]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6).join('');
      onChange(next);
      const focusIdx = Math.min(pasted.length, 5);
      setTimeout(() => focusBox(focusIdx), 0);
    }
  }, [onChange, focusBox]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => focusBox(0), 50);
    }
  }, [autoFocus, focusBox]);

  return (
    <div>
      <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={el => inputRefs.current[idx] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onFocus={(e) => e.target.select()}
            className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-gray-50 transition-all duration-150 focus:outline-none focus:bg-white caret-transparent ${
              digit
                ? error
                  ? 'border-red-400 text-red-600 bg-red-50'
                  : 'border-black text-gray-900 bg-white shadow-sm'
                : error
                  ? 'border-red-300 text-red-400'
                  : 'border-gray-200 text-gray-900 focus:border-black focus:shadow-sm'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
            aria-label={`Digit ${idx + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2.5 text-center text-xs text-red-600 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}


export function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('mode') === 'register' || p.get('tab') === 'register' || p.get('signup') === 'true';
    }
    return false;
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showHandlesSection, setShowHandlesSection] = useState(false);
  const [leetcodeHandle, setLeetcodeHandle] = useState('');
  const [codeforcesHandle, setCodeforcesHandle] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Registration Verification Modal State (Password Sign-Up)
  const [showRegVerifyModal, setShowRegVerifyModal] = useState(false);
  const [regVerifyCode, setRegVerifyCode] = useState('');
  const [regVerifyLoading, setRegVerifyLoading] = useState(false);
  const [regVerifyError, setRegVerifyError] = useState('');
  const [regVerifySuccess, setRegVerifySuccess] = useState('');
  const [regCooldown, setRegCooldown] = useState(0);
  const [testOtpNotice, setTestOtpNotice] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');
  const [regVerificationToken, setRegVerificationToken] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotTestOtp, setForgotTestOtp] = useState('');
  const [forgotVerificationToken, setForgotVerificationToken] = useState('');

  // Resend Email Modal State
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendType, setResendType] = useState('register');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  // GitHub Fallback Modal (if GitHub app unconfigured on server)
  const [showGhModal, setShowGhModal] = useState(false);
  const [customGhUser, setCustomGhUser] = useState('');

  // Cooldown countdown timers
  useEffect(() => {
    if (regCooldown <= 0) return;
    const interval = setInterval(() => {
      setRegCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [regCooldown]);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const interval = setInterval(() => {
      setForgotCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotCooldown]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle URL errors/info
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    const oauthInfo = params.get('oauth_info');

    if (oauthError) {
      setError(`Authentication notice: ${decodeURIComponent(oauthError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthInfo) {
      if (oauthInfo.includes('github')) {
        setShowGhModal(true);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Direct Google Sign In handler
  const handleGoogleClick = () => {
    setError('');
    setOauthLoading(true);
    window.location.href = '/api/auth/google';
  };

  // GitHub Sign In handler
  const handleGitHubClick = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const res = await fetch('/api/auth/config');
      const data = await res.json();
      if (data?.providers?.github?.configured) {
        window.location.href = '/api/auth/github';
      } else {
        setShowGhModal(true);
      }
    } catch (e) {
      setShowGhModal(true);
    } finally {
      setOauthLoading(false);
    }
  };

  // --- 1. SIGN IN (EMAIL + PASSWORD) ---
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide a valid email address');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);

    // If existing user has a password set locally, verify it
    if (existing && existing.password && password) {
      if (existing.password !== password) {
        setError('Incorrect password. Click "Forgot?" below to reset it.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Sync with server user store
      const res = await fetch('/api/auth/register-or-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: existing?.name || cleanEmail.split('@')[0],
          handles: existing?.handles || {},
          targetRole: existing?.targetRole || targetRole,
          password: password || existing?.password,
          provider: 'email'
        })
      });
      const serverUser = data?.user || {};
      const mergedHandles = {
        leetcode: existing?.handles?.leetcode || serverUser?.handles?.leetcode || '',
        codeforces: existing?.handles?.codeforces || serverUser?.handles?.codeforces || '',
        github: existing?.handles?.github || serverUser?.handles?.github || ''
      };

      const studentUser = saveUserToRegistry({
        ...serverUser,
        ...existing,
        email: cleanEmail,
        name: existing?.name || serverUser?.name || cleanEmail.split('@')[0],
        targetRole: existing?.targetRole || serverUser?.targetRole || 'Software Development Engineer (SDE-1)',
        handles: mergedHandles,
        onboardingCompleted: true
      });

      onLogin(studentUser);
    } catch (err) {
      // Fallback offline sign in
      const studentUser = saveUserToRegistry({
        ...existing,
        email: cleanEmail,
        name: existing?.name || cleanEmail.split('@')[0],
        handles: {
          leetcode: existing?.handles?.leetcode || '',
          codeforces: existing?.handles?.codeforces || '',
          github: existing?.handles?.github || ''
        },
        onboardingCompleted: true
      });
      onLogin(studentUser);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CREATE ACCOUNT (TRIGGER EMAIL VERIFICATION OTP) ---
  const handleCreateAccountRequest = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: name.trim() || cleanEmail.split('@')[0],
          handles: {
            leetcode: leetcodeHandle.trim(),
            codeforces: codeforcesHandle.trim(),
            github: githubHandle.trim()
          },
          targetRole
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegCooldown(data.cooldownSeconds || 30);
        if (data.verificationToken) {
          setRegVerificationToken(data.verificationToken);
        }
        setDeliveryMode(data.emailDelivered ? 'smtp' : 'sandbox');
        setRegVerifySuccess(
          `We've sent a 6-digit code to ${cleanEmail}. Check your inbox and spam/junk folder.`
        );
        setRegVerifyError('');
        setShowRegVerifyModal(true);
      } else {
        setError(data.message || 'Failed to dispatch verification email');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. VERIFY REGISTRATION CODE (COMPLETES ACCOUNT & SENDS WELCOME EMAIL) ---
  const handleVerifyRegistrationCode = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!regVerifyCode.trim() || regVerifyCode.trim().length < 6) {
      setRegVerifyError('Please enter the complete 6-digit code');
      return;
    }

    setRegVerifyLoading(true);
    setRegVerifyError('');

    try {
      const res = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: regVerifyCode.trim(),
          verificationToken: regVerificationToken,
          regData: {
            name: name.trim() || cleanEmail.split('@')[0],
            password,
            handles: {
              leetcode: leetcodeHandle.trim(),
              codeforces: codeforcesHandle.trim(),
              github: githubHandle.trim()
            },
            targetRole
          }
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegVerifySuccess('Email verified successfully! Welcome to PrepStack.');
        
        // Save unified user to local storage registry
        const registeredUser = saveUserToRegistry({
          ...(data.user || {}),
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
          password,
          emailVerified: true,
          handles: {
            leetcode: leetcodeHandle.trim(),
            codeforces: codeforcesHandle.trim(),
            github: githubHandle.trim()
          },
          targetRole,
          onboardingCompleted: true
        });

        setTimeout(() => {
          setShowRegVerifyModal(false);
          onLogin(registeredUser);
        }, 800);
      } else {
        setRegVerifyError(data.message || 'Invalid or expired code. Please try again.');
      }
    } catch (err) {
      setRegVerifyError('Verification failed. Please check your connection.');
    } finally {
      setRegVerifyLoading(false);
    }
  };

  // --- 4. RESEND REGISTRATION OTP ---
  const handleResendRegCode = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (regCooldown > 0) return;

    setRegVerifyLoading(true);
    setRegVerifyError('');

    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: name.trim() || cleanEmail.split('@')[0],
          handles: {
            leetcode: leetcodeHandle.trim(),
            codeforces: codeforcesHandle.trim(),
            github: githubHandle.trim()
          },
          targetRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegCooldown(data.cooldownSeconds || 30);
        if (data.verificationToken) {
          setRegVerificationToken(data.verificationToken);
        }
        setRegVerifySuccess(`A fresh verification code was sent to ${cleanEmail}. Check your inbox or spam/junk folder.`);
      } else {
        setRegVerifyError(data.message || 'Failed to resend code');
        if (data.remainingCooldown) setRegCooldown(data.remainingCooldown);
      }
    } catch (err) {
      setRegVerifyError('Could not connect to server.');
    } finally {
      setRegVerifyLoading(false);
    }
  };

  // --- 5. FORGOT PASSWORD: STEP 1 (REQUEST RESET OTP) ---
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    const targetEmail = (forgotEmail.trim() || email.trim()).toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotCooldown(data.cooldownSeconds || 30);
        if (data.verificationToken) {
          setForgotVerificationToken(data.verificationToken);
        }
        setForgotSuccess(`We sent a 6-digit code to ${targetEmail}. Check your inbox and spam/junk folder.`);
        setForgotStep(2);
      } else {
        setForgotError(data.message || 'Failed to dispatch reset code');
      }
    } catch (err) {
      setForgotError('Could not connect to server.');
    } finally {
      setForgotLoading(false);
    }
  };

  // --- 6. FORGOT PASSWORD: STEP 2 (VERIFY CODE & SET NEW PASSWORD) ---
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = (forgotEmail.trim() || email.trim()).toLowerCase();

    if (!forgotCode.trim() || forgotCode.trim().length < 6) {
      setForgotError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          code: forgotCode.trim(),
          newPassword,
          verificationToken: forgotVerificationToken
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccess('Password updated successfully! Signing you in...');
        updateUserPasswordInRegistry(targetEmail, newPassword);

        setTimeout(() => {
          const user = findUserByEmail(targetEmail) || saveUserToRegistry({
            email: targetEmail,
            name: targetEmail.split('@')[0],
            password: newPassword,
            provider: 'email',
            onboardingCompleted: true
          });
          setShowForgotModal(false);
          onLogin(user);
        }, 900);
      } else {
        setForgotError(data.message || 'Invalid or expired code. Please try again.');
      }
    } catch (err) {
      setForgotError('Could not connect to server.');
    } finally {
      setForgotLoading(false);
    }
  };

  // --- 7. RESEND MODAL HANDLER ---
  const handleResendModalSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = (resendEmail.trim() || email.trim()).toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setResendError('Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setResendError('');
    setResendMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          type: resendType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.verificationToken) {
          if (resendType === 'register') {
            setRegVerificationToken(data.verificationToken);
          } else {
            setForgotVerificationToken(data.verificationToken);
          }
        }
        setResendMessage(
          data.emailResult?.delivered
            ? `Verification email delivered to ${targetEmail}!`
            : `Code generated for ${targetEmail}: ${data.testOtp || ''} (Resend sandbox mode: code auto-available)`
        );
        setResendCooldown(data.cooldownSeconds || 30);
      } else {
        setResendError(data.message || 'Failed to dispatch email');
        if (data.remainingCooldown) setResendCooldown(data.remainingCooldown);
      }
    } catch (err) {
      setResendError('Could not connect to server.');
    } finally {
      setResendLoading(false);
    }
  };

  // --- 8. DEMO PRESETS ---
  const handleDemoPreset = (preset) => {
    if (preset === 'fresh') {
      onLogin({
        name: 'Alex Rivera',
        email: 'alex.rivera@cs.edu',
        targetRole: 'Software Engineer',
        handles: { leetcode: '', codeforces: '', github: '' },
        loggedInAt: new Date().toISOString()
      });
    } else if (preset === 'neal') {
      onLogin({
        name: 'Neal Wu',
        email: 'neal@tech.io',
        targetRole: 'Senior SDE / Tech Lead',
        handles: { leetcode: 'neal_wu', codeforces: 'Petr', github: 'gaearon' },
        loggedInAt: new Date().toISOString()
      });
    } else {
      onLogin({
        name: 'Gennady Korotkevich',
        email: 'tourist@itmo.ru',
        targetRole: 'Algorithms & Quant Lead',
        handles: { leetcode: 'tourist', codeforces: 'tourist', github: 'torvalds' },
        loggedInAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#111827] flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white font-sans antialiased">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Main Auth Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-7 sm:p-8 relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-black text-white shadow-sm mb-1">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome to Prep<span className="text-blue-600">Stack</span>
          </h1>
          <p className="text-xs text-gray-500 font-normal">
            Placement readiness & developer portfolio dashboard
          </p>
        </div>

        {/* Social Authentication */}
        <div className="space-y-2.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={oauthLoading}
            className="w-full h-11 rounded-xl bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50/80 text-gray-800 text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-150 shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4 flex-shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={handleGitHubClick}
            disabled={oauthLoading}
            className="w-full h-11 rounded-xl bg-[#18181b] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-150 shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <GitHubIcon className="w-4 h-4 flex-shrink-0 text-white" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-gray-200" />
          <span className="absolute bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            or continue with email
          </span>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              !isRegistering
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              isRegistering
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={isRegistering ? handleCreateAccountRequest : handleSignIn} className="space-y-3.5 text-xs">
          {/* Full Name (Only on Registration) */}
          {isRegistering && (
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-[11px]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhideep Jain"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-700 font-medium text-[11px]">
                Password {isRegistering && <span className="text-gray-400 font-normal">(min 6 chars)</span>}
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || '');
                    setForgotStep(1);
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Optional Handles Toggle for Registration */}
          {isRegistering && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHandlesSection(!showHandlesSection)}
                className="flex items-center justify-between w-full py-1 text-[11px] text-gray-600 hover:text-gray-900 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  Connect LeetCode / Codeforces handles (Optional)
                </span>
                {showHandlesSection ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {showHandlesSection && (
                <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
                  <div>
                    <label className="block text-gray-600 font-medium text-[10px] mb-0.5">LeetCode Username</label>
                    <input
                      type="text"
                      value={leetcodeHandle}
                      onChange={(e) => setLeetcodeHandle(e.target.value)}
                      placeholder="e.g. neal_wu"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-[10px] mb-0.5">Codeforces Handle</label>
                    <input
                      type="text"
                      value={codeforcesHandle}
                      onChange={(e) => setCodeforcesHandle(e.target.value)}
                      placeholder="e.g. tourist"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-[10px] mb-0.5">GitHub Username</label>
                    <input
                      type="text"
                      value={githubHandle}
                      onChange={(e) => setGithubHandle(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isRegistering ? 'Sending Verification Code...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <span>{isRegistering ? 'Create Profile & Continue' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend Verification Email Trigger Link */}
          <div className="flex items-center justify-center pt-1 text-[11px] text-gray-500">
            <span>Didn't receive verification email?</span>
            <button
              type="button"
              onClick={() => {
                setResendEmail(email || '');
                setResendType(isRegistering ? 'register' : 'forgot_password');
                setResendError('');
                setResendMessage('');
                setShowResendModal(true);
              }}
              className="ml-1 text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
            >
              Resend email
            </button>
          </div>
        </form>
      </div>

      {/* --- MODAL 1: REGISTRATION EMAIL VERIFICATION CODE MODAL (ENTERPRISE GRADE) --- */}
      {showRegVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 antialiased animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] rounded-3xl bg-white border border-gray-200/90 shadow-2xl p-7 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <MailCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Verify Your Email</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Security &bull; Account Activation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegVerifyModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle / Email Address Display */}
            <div className="rounded-2xl bg-gray-50/80 border border-gray-200/70 p-3.5 text-center">
              <p className="text-[11px] text-gray-500 mb-0.5">We sent a 6-digit verification code to</p>
              <p className="text-xs font-semibold text-gray-900 font-mono break-all">{email}</p>
            </div>

            {/* Success Banner */}
            {regVerifySuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{regVerifySuccess}</span>
              </div>
            )}

            {/* OTP 6-Box Form */}
            <form onSubmit={handleVerifyRegistrationCode} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-2.5 text-center uppercase tracking-wider">
                  Enter 6-Digit Code
                </label>
                <OTPInput
                  value={regVerifyCode}
                  onChange={(val) => {
                    setRegVerifyCode(val);
                    if (regVerifyError) setRegVerifyError('');
                  }}
                  error={regVerifyError}
                  autoFocus={true}
                />
              </div>

              {/* Provider-specific inbox guidance */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900/90 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Can't find the email?</span>
                </div>
                <p className="text-[10px] leading-relaxed text-amber-800/90">
                  Please check your <strong>Spam / Junk</strong> folder. In <strong>Outlook / Hotmail</strong>, check the <strong>"Other"</strong> tab. For college/university domains, institutional mail filters can occasionally introduce a 1&ndash;2 minute delivery delay.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={regVerifyLoading || regVerifyCode.length < 6}
                className="w-full h-11 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {regVerifyLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email &amp; Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Footer Actions: Change Email & Resend Code */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowRegVerifyModal(false)}
                  className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendRegCode}
                  disabled={regCooldown > 0 || regVerifyLoading}
                  className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {regCooldown > 0 ? (
                    <span className="tabular-nums">Resend in {regCooldown}s</span>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: FORGOT PASSWORD MODAL (ENTERPRISE GRADE) --- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 antialiased animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] rounded-3xl bg-white border border-gray-200/90 shadow-2xl p-7 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Reset Password</h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {forgotStep === 1 ? 'Step 1 of 2 &bull; Identity Verification' : 'Step 2 of 2 &bull; New Security Credentials'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications */}
            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotRequest} className="space-y-4 text-xs">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Enter your registered email address and we'll transmit a secure 6-digit verification code to reset your credentials.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-11 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Reset Code...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter code & set new password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                {/* Email Chip */}
                <div className="rounded-xl bg-gray-50 border border-gray-200/70 p-2.5 text-center">
                  <p className="text-[10px] text-gray-500">Reset code sent to</p>
                  <p className="text-xs font-semibold text-gray-900 font-mono break-all">{forgotEmail || email}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-2 text-center uppercase tracking-wider">
                    6-Digit Security Code
                  </label>
                  <OTPInput
                    value={forgotCode}
                    onChange={(val) => {
                      setForgotCode(val);
                      if (forgotError) setForgotError('');
                    }}
                    error={forgotError}
                    autoFocus={true}
                  />
                </div>

                {/* Spam/Junk Reminder */}
                <p className="text-[10px] text-center text-gray-500">
                  Can't find the email? Check your <strong>Spam / Junk</strong> folder or Outlook <strong>"Other"</strong> tab.
                </p>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || forgotCode.length < 6 || newPassword.length < 6}
                  className="w-full h-11 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={handleForgotRequest}
                    disabled={forgotCooldown > 0 || forgotLoading}
                    className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    {forgotCooldown > 0 ? (
                      <span className="tabular-nums">Resend in {forgotCooldown}s</span>
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: RESEND VERIFICATION EMAIL MODAL --- */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 antialiased">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MailCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Resend Verification Email</h3>
                  <p className="text-[10px] text-gray-500">Account confirmation & login codes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResendModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resendMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resendMessage}</span>
              </div>
            )}

            {resendError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resendError}</span>
              </div>
            )}

            <form onSubmit={handleResendModalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Student Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Email Purpose
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResendType('register')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                      resendType === 'register'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    Account Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setResendType('forgot_password')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                      resendType === 'forgot_password'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    Password Reset
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={resendLoading || resendCooldown > 0}
                className="w-full h-10 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: GITHUB FALLBACK MODAL --- */}
      {showGhModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GitHubIcon className="w-5 h-5 text-gray-900" />
                <h3 className="text-sm font-semibold text-gray-900">Connect GitHub Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGhModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Enter your public GitHub handle to instantly sync your avatar, repositories, and developer activity.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ghUser = customGhUser.trim() || 'torvalds';
                const userEmail = (email && email.trim().includes('@')) ? email.trim().toLowerCase() : `${ghUser}@users.noreply.github.com`;
                const existing = findUserByEmail(userEmail);
                const student = saveUserToRegistry({
                  ...existing,
                  name: existing?.name || ghUser,
                  email: userEmail,
                  provider: 'github',
                  avatarUrl: existing?.avatarUrl || `https://github.com/${encodeURIComponent(ghUser)}.png`,
                  handles: {
                    leetcode: existing?.handles?.leetcode || '',
                    codeforces: existing?.handles?.codeforces || '',
                    github: existing?.handles?.github || ghUser
                  },
                  onboardingCompleted: true
                });
                setShowGhModal(false);
                onLogin(student);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={customGhUser}
                  onChange={(e) => setCustomGhUser(e.target.value)}
                  placeholder="e.g. torvalds or your_username"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGhModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium shadow-xs"
                >
                  Connect Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Demo Presets */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 z-10">
        <span>Quick demo accounts:</span>
        <button
          type="button"
          onClick={() => handleDemoPreset('fresh')}
          className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-2xs hover:border-gray-300 font-medium transition-all cursor-pointer"
        >
          Fresh Student
        </button>
        <button
          type="button"
          onClick={() => handleDemoPreset('neal')}
          className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-2xs hover:border-gray-300 font-medium transition-all cursor-pointer"
        >
          Neal Wu (LC #2)
        </button>
        <button
          type="button"
          onClick={() => handleDemoPreset('tourist')}
          className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-2xs hover:border-gray-300 font-medium transition-all cursor-pointer"
        >
          Tourist (CF 3300+)
        </button>
      </div>
    </div>
  );
}
