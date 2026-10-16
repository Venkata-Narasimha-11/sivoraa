import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User as UserIcon, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { loginSchema, LoginFormData } from '../types/forms';
import authService from '../services/authService';
import useAuthStore from '../stores/useAuthStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/common/ErrorMessage';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginToStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => { reset({ username: '', password: '' }); }, [reset]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await authService.login(data);
      loginToStore(response.user, response.token.access_token);
      // Admin → admin panel | Customer → landing page
      if (response.user?.role === 'admin' || data.username === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Failed to authenticate.';
      setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(160deg, #fdf8ee 0%, #f7e8c0 35%, #ede0a8 70%, #e4d090 100%)',
      }}
    >
      {/* subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, rgba(120,90,0,0.8) 0px, rgba(120,90,0,0.8) 1px, transparent 1px, transparent 28px),
                            repeating-linear-gradient(-45deg, rgba(120,90,0,0.8) 0px, rgba(120,90,0,0.8) 1px, transparent 1px, transparent 28px)`,
        }}
      />

      <div className="relative w-full max-w-md">

        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-80 transition-opacity"
          style={{ color: 'rgba(100,72,0,0.7)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to SIVORA
        </Link>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,252,240,0.95)',
            border: '1.5px solid rgba(160,120,0,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Brand mark */}
          <div className="text-center mb-8">
            <h1
              className="font-black tracking-[0.22em] uppercase"
              style={{
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #5a3c00 0%, #a07000 35%, #d4aa00 60%, #a07000 80%, #5a3c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SIVORA
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: 'rgba(100,72,0,0.55)' }}>
              Luxe Fashion &amp; Lifestyle
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(160,120,0,0.3))' }} />
              <span style={{ color: 'rgba(160,120,0,0.5)', fontSize: 12 }}>✦</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(160,120,0,0.3), transparent)' }} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1">Welcome back! Access your bag and orders.</p>
          </div>

          {/* registration success */}
          {searchParams.get('registered') === 'true' && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
              <span className="text-emerald-600 mt-0.5">✅</span>
              <div>
                <p className="font-semibold">Registration Complete!</p>
                <p className="text-[11px] text-emerald-700">Your luxury account is ready. Please sign in.</p>
              </div>
            </div>
          )}

          {/* server error */}
          {serverError && (
            <div className="mb-4">
              <ErrorMessage title="Authentication Failed" message={serverError} data-testid="login-server-error" />
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form" autoComplete="off" noValidate>
            <input type="text"     name="prevent_autofill"     style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="prevent_autofill_pwd" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="new-password" />

            <Input
              label="Username or Email"
              id="username"
              placeholder="Enter username or email"
              leftIcon={<UserIcon className="h-4 w-4 text-slate-400" />}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              error={errors.username?.message}
              data-testid="username-input"
              {...register('username')}
            />

            <div className="relative">
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                autoComplete="new-password"
                error={errors.password?.message}
                data-testid="password-input"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                tabIndex={-1}
                aria-label="Toggle visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold tracking-wide text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #7a5c00 0%, #c9960c 50%, #a07808 100%)',
                border: 'none',
              }}
              isLoading={isSubmitting}
              data-testid="login-submit-btn"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to SIVORA
            </Button>
          </form>

          {/* footer */}
          <div className="mt-7 pt-5 border-t text-center text-xs text-slate-500 space-y-2" style={{ borderColor: 'rgba(160,120,0,0.15)' }}>
            <div>
              New to SIVORA?{' '}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#c9960c' }}>
                Create Account
              </Link>
            </div>
            <div className="text-[11px] text-slate-400">
              By signing in you agree to Atelier Sivora's Terms of Runway Service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
