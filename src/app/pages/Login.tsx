import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Hash,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/mockData';

type View = 'login' | 'signup' | 'forgot';
type Role = 'student' | 'admin';

interface FieldError {
  [key: string]: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Enter password'}
          className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm bg-white focus:outline-none transition-colors ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  type = 'text',
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ElementType;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none transition-colors ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

export function Login() {
  const { loginByEmail, signupStudent, signupAdmin } = useApp();
  const navigate = useNavigate();

  const [view, setView] = useState<View>('login');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [globalError, setGlobalError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupMajor, setSignupMajor] = useState('Computer Science');
  const [signupYear, setSignupYear] = useState(1);
  const [signupAccessCode, setSignupAccessCode] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const accentColor = role === 'admin' ? 'emerald' : 'indigo';

  const clearErrors = () => {
    setErrors({});
    setGlobalError('');
  };

  const switchView = (v: View) => {
    clearErrors();
    setView(v);
    setForgotSent(false);
  };

  const switchRole = (r: Role) => {
    clearErrors();
    setRole(r);
  };

  // --- Login submit ---
  const handleLogin = async () => {
    clearErrors();
    const errs: FieldError = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Email is required';
    else if (!validateEmail(loginEmail)) errs.loginEmail = 'Enter a valid email address';
    if (!loginPassword.trim()) errs.loginPassword = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const result = await loginByEmail(loginEmail, loginPassword, role);
    setLoading(false);

    if (result.success) {
      navigate(role === 'admin' ? '/admin' : '/student');
    } else {
      setGlobalError(result.message);
    }
  };

  // --- Signup submit ---
  const handleSignup = async () => {
    clearErrors();
    const errs: FieldError = {};
    if (!signupName.trim()) errs.signupName = 'Full name is required';
    if (!signupEmail.trim()) errs.signupEmail = 'Email is required';
    else if (!validateEmail(signupEmail)) errs.signupEmail = 'Enter a valid email address';
    if (role === 'admin' && !signupAccessCode.trim()) errs.signupAccessCode = 'Access code is required';
    if (!signupPassword) errs.signupPassword = 'Password is required';
    else if (signupPassword.length < 8) errs.signupPassword = 'Password must be at least 8 characters';
    if (!signupConfirm) errs.signupConfirm = 'Please confirm your password';
    else if (signupConfirm !== signupPassword) errs.signupConfirm = 'Passwords do not match';
    if (!agreedTerms) errs.agreedTerms = 'You must agree to the terms';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    let result: { success: boolean; message: string };
    if (role === 'student') {
      result = await signupStudent({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        major: signupMajor,
        year: signupYear,
      });
    } else {
      result = await signupAdmin({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        accessCode: signupAccessCode,
      });
    }

    setLoading(false);
    if (result.success) {
      navigate(role === 'admin' ? '/admin' : '/student');
    } else {
      setGlobalError(result.message);
    }
  };

  // --- Forgot submit ---
  const handleForgot = async () => {
    clearErrors();
    if (!forgotEmail.trim()) { setErrors({ forgotEmail: 'Email is required' }); return; }
    if (!validateEmail(forgotEmail)) { setErrors({ forgotEmail: 'Enter a valid email address' }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setForgotSent(true);
  };

  const btnBase = `w-full py-2.5 rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60`;
  const btnColor =
    role === 'admin'
      ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700';

  const demoHint =
    view === 'login'
      ? role === 'student'
        ? 'Demo student: emma.wilson@university.edu · password demo'
        : 'Demo admin: admin@university.edu · password Admin@123'
      : role === 'admin'
      ? 'Access code: ADMIN2026'
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white" style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>
            CourseSync
          </h1>
          <p className="text-indigo-300 text-xs mt-1">Student Course Registration Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* === FORGOT PASSWORD VIEW === */}
          {view === 'forgot' && (
            <div className="p-7">
              <button
                onClick={() => switchView('login')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>

              {forgotSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-slate-900 mb-2">Check your inbox</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    We've sent a password reset link to
                  </p>
                  <p className="text-indigo-600 text-sm mt-1" style={{ fontWeight: 600 }}>
                    {forgotEmail}
                  </p>
                  <p className="text-slate-400 text-xs mt-3">
                    Didn't receive it? Check your spam folder or{' '}
                    <button
                      onClick={() => setForgotSent(false)}
                      className="text-indigo-600 hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                  <button
                    onClick={() => switchView('login')}
                    className="mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Return to login
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <h2 className="text-slate-900 mb-1">Reset your password</h2>
                    <p className="text-slate-500 text-sm">
                      Enter your registered email and we'll send you a reset link.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="forgot-email" className="block text-sm text-slate-600 mb-1.5">
                        Email address
                      </label>
                      <TextInput
                        id="forgot-email"
                        value={forgotEmail}
                        onChange={setForgotEmail}
                        placeholder="you@university.edu"
                        icon={Mail}
                        error={errors.forgotEmail}
                        type="email"
                      />
                    </div>

                    <button
                      onClick={handleForgot}
                      disabled={loading}
                      className={`${btnBase} bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700`}
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Send Reset Link
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === LOGIN / SIGNUP VIEWS === */}
          {view !== 'forgot' && (
            <>
              {/* View tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => switchView('login')}
                  className={`flex-1 py-3.5 text-sm transition-colors border-b-2 ${
                    view === 'login'
                      ? role === 'admin'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  style={{ fontWeight: view === 'login' ? 600 : 400 }}
                >
                  Log In
                </button>
                <button
                  onClick={() => switchView('signup')}
                  className={`flex-1 py-3.5 text-sm transition-colors border-b-2 ${
                    view === 'signup'
                      ? role === 'admin'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  style={{ fontWeight: view === 'signup' ? 600 : 400 }}
                >
                  Sign Up
                </button>
              </div>

              <div className="p-7">
                {/* Role selector */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    onClick={() => switchRole('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-all duration-150 ${
                      role === 'student'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    style={{ fontWeight: role === 'student' ? 600 : 400 }}
                  >
                    <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-indigo-500' : 'text-slate-400'}`} />
                    Student
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-all duration-150 ${
                      role === 'admin'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    style={{ fontWeight: role === 'admin' ? 600 : 400 }}
                  >
                    <ShieldCheck className={`w-4 h-4 ${role === 'admin' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    Admin
                  </button>
                </div>

                {/* Global error */}
                {globalError && (
                  <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-3.5 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {globalError}
                  </div>
                )}

                {/* ---- LOGIN FORM ---- */}
                {view === 'login' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="login-email" className="block text-sm text-slate-600 mb-1.5">
                        Email address
                      </label>
                      <TextInput
                        id="login-email"
                        value={loginEmail}
                        onChange={setLoginEmail}
                        placeholder="you@university.edu"
                        icon={Mail}
                        error={errors.loginEmail}
                        type="email"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="login-password" className="text-sm text-slate-600">
                          Password
                        </label>
                        <button
                          onClick={() => switchView('forgot')}
                          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <PasswordInput
                        id="login-password"
                        value={loginPassword}
                        onChange={setLoginPassword}
                        placeholder="Enter your password"
                        error={errors.loginPassword}
                      />
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer select-none">
                        Remember me for 30 days
                      </label>
                    </div>

                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      className={`${btnBase} ${btnColor} mt-1`}
                      style={{ fontWeight: 600 }}
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Log In
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                      New to CourseSync?{' '}
                      <button
                        onClick={() => switchView('signup')}
                        className={`${role === 'admin' ? 'text-emerald-600 hover:text-emerald-700' : 'text-indigo-600 hover:text-indigo-700'} hover:underline transition-colors`}
                        style={{ fontWeight: 600 }}
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                )}

                {/* ---- SIGNUP FORM ---- */}
                {view === 'signup' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="signup-name" className="block text-sm text-slate-600 mb-1.5">
                        Full name
                      </label>
                      <TextInput
                        id="signup-name"
                        value={signupName}
                        onChange={setSignupName}
                        placeholder="Jane Smith"
                        icon={User}
                        error={errors.signupName}
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-email" className="block text-sm text-slate-600 mb-1.5">
                        Email address
                      </label>
                      <TextInput
                        id="signup-email"
                        value={signupEmail}
                        onChange={setSignupEmail}
                        placeholder="you@university.edu"
                        icon={Mail}
                        error={errors.signupEmail}
                        type="email"
                      />
                    </div>

                    {/* Student-only fields */}
                    {role === 'student' && (
                      <div>
                        <label className="block text-sm text-slate-600 mb-1.5">Year</label>
                        <select
                          value={signupYear}
                          onChange={(e) => setSignupYear(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                        >
                          <option value={1}>1st Year</option>
                          <option value={2}>2nd Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={4}>4th Year</option>
                        </select>
                      </div>
                    )}

                    {/* Admin-only: major + access code */}
                    {role === 'admin' && (
                      <>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1.5">Department / Major</label>
                          <select
                            value={signupMajor}
                            onChange={(e) => setSignupMajor(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="signup-code" className="block text-sm text-slate-600 mb-1.5">
                            Admin Access Code
                            <span className="ml-1.5 text-xs text-slate-400">(provided by IT department)</span>
                          </label>
                          <TextInput
                            id="signup-code"
                            value={signupAccessCode}
                            onChange={setSignupAccessCode}
                            placeholder="Enter access code"
                            icon={Hash}
                            error={errors.signupAccessCode}
                          />
                          <p className="mt-1 text-xs text-slate-400">Demo access code: ADMIN2026</p>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="signup-password" className="block text-sm text-slate-600 mb-1.5">
                        Password
                        <span className="ml-1.5 text-xs text-slate-400">(min. 8 characters)</span>
                      </label>
                      <PasswordInput
                        id="signup-password"
                        value={signupPassword}
                        onChange={setSignupPassword}
                        placeholder="Create a strong password"
                        error={errors.signupPassword}
                      />
                      {/* Strength indicator */}
                      {signupPassword && (
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4].map((level) => {
                            const strength = Math.min(
                              4,
                              (signupPassword.length >= 8 ? 1 : 0) +
                                (/[A-Z]/.test(signupPassword) ? 1 : 0) +
                                (/[0-9]/.test(signupPassword) ? 1 : 0) +
                                (/[^a-zA-Z0-9]/.test(signupPassword) ? 1 : 0)
                            );
                            return (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  level <= strength
                                    ? strength <= 1
                                      ? 'bg-rose-400'
                                      : strength <= 2
                                      ? 'bg-amber-400'
                                      : strength <= 3
                                      ? 'bg-yellow-400'
                                      : 'bg-emerald-500'
                                    : 'bg-slate-200'
                                }`}
                              />
                            );
                          })}
                          <span className="text-xs text-slate-400 ml-1 leading-none">
                            {(() => {
                              const s =
                                (signupPassword.length >= 8 ? 1 : 0) +
                                (/[A-Z]/.test(signupPassword) ? 1 : 0) +
                                (/[0-9]/.test(signupPassword) ? 1 : 0) +
                                (/[^a-zA-Z0-9]/.test(signupPassword) ? 1 : 0);
                              return s <= 1 ? 'Weak' : s <= 2 ? 'Fair' : s <= 3 ? 'Good' : 'Strong';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="signup-confirm" className="block text-sm text-slate-600 mb-1.5">
                        Confirm password
                      </label>
                      <PasswordInput
                        id="signup-confirm"
                        value={signupConfirm}
                        onChange={setSignupConfirm}
                        placeholder="Re-enter your password"
                        error={errors.signupConfirm}
                      />
                      {signupConfirm && signupPassword === signupConfirm && (
                        <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`flex items-start gap-2.5 cursor-pointer select-none ${errors.agreedTerms ? 'text-rose-600' : 'text-slate-500'}`}>
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-slate-300 cursor-pointer flex-shrink-0"
                          style={{ accentColor: role === 'admin' ? '#10b981' : '#6366f1' }}
                        />
                        <span className="text-sm leading-snug">
                          I agree to the{' '}
                          <span className={`${role === 'admin' ? 'text-emerald-600' : 'text-indigo-600'} hover:underline cursor-pointer`}>
                            Terms of Service
                          </span>{' '}
                          and{' '}
                          <span className={`${role === 'admin' ? 'text-emerald-600' : 'text-indigo-600'} hover:underline cursor-pointer`}>
                            Privacy Policy
                          </span>
                        </span>
                      </label>
                      {errors.agreedTerms && (
                        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.agreedTerms}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleSignup}
                      disabled={loading}
                      className={`${btnBase} ${btnColor} mt-1`}
                      style={{ fontWeight: 600 }}
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Create Account
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                      Already have an account?{' '}
                      <button
                        onClick={() => switchView('login')}
                        className={`${role === 'admin' ? 'text-emerald-600 hover:text-emerald-700' : 'text-indigo-600 hover:text-indigo-700'} hover:underline transition-colors`}
                        style={{ fontWeight: 600 }}
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Demo hint */}
        {demoHint && (
          <p className="text-center text-slate-500 text-xs mt-4">
            <span className="text-slate-400">Demo hint:</span> {demoHint}
          </p>
        )}

        <p className="text-center text-slate-600 text-xs mt-3">Spring 2026 · Demo Environment</p>
      </div>
    </div>
  );
}