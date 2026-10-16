import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User as UserIcon,
  UserPlus,
  Sparkles,
  Crown,
} from 'lucide-react';
import { registerSchema, RegisterFormData } from '../types/forms';
import authService from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ErrorMessage from '../components/common/ErrorMessage';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      full_name: '',
      phone_number: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await authService.register(data);
      navigate('/login?registered=true');
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Failed to register account. Please check your information.';
      setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 dark:from-pink-950/50 dark:via-rose-950/50 dark:to-amber-950/50 border border-pink-200/80 dark:border-pink-800/60 text-xs font-bold tracking-wide text-pink-700 dark:text-pink-300 mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span>Welcome to SIVORA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Your Client Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Join Sivora Luxe for personalized fashion curations and priority shipping
        </p>
      </div>

      <Card className="p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl">
        {serverError && (
          <div className="mb-5">
            <ErrorMessage
              title="Registration Error"
              message={serverError}
              data-testid="register-server-error"
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-testid="register-form"
          noValidate
        >
          {/* Full Name & Username in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              id="reg-fullname"
              placeholder="Aarav Sharma"
              leftIcon={<UserIcon className="h-4 w-4 text-slate-400" />}
              error={errors.full_name?.message}
              data-testid="register-fullname-input"
              {...register('full_name')}
            />

            <Input
              label="Username"
              id="reg-username"
              placeholder="aarav_sivora"
              leftIcon={<UserIcon className="h-4 w-4 text-slate-400" />}
              error={errors.username?.message}
              data-testid="register-username-input"
              {...register('username')}
            />
          </div>



          {/* Email Address */}
          <Input
            label="Email Address"
            id="reg-email"
            type="email"
            placeholder="client@atelier-sivora.com"
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            error={errors.email?.message}
            data-testid="register-email-input"
            {...register('email')}
          />

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Password"
              id="reg-password"
              type="password"
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              error={errors.password?.message}
              data-testid="register-password-input"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              id="reg-confirm-password"
              type="password"
              placeholder="Confirm password"
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              error={errors.confirmPassword?.message}
              data-testid="register-confirm-password-input"
              {...register('confirmPassword')}
            />
          </div>

          {/* Account Role Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Account Membership Level
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all hover:border-pink-500 hover:bg-pink-50/30 dark:hover:bg-slate-800 text-xs font-medium">
                <input
                  type="radio"
                  value="customer"
                  defaultChecked
                  {...register('role')}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Customer
                  </span>
                  <span className="text-[10px] text-slate-400">Personal shopper</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 border border-purple-200 dark:border-purple-800/60 rounded-xl cursor-pointer transition-all hover:border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 text-xs font-medium">
                <input
                  type="radio"
                  value="admin"
                  {...register('role')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Store Admin
                  </span>
                  <span className="text-[10px] text-purple-500/80">Inventory & Analytics</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-3 font-medium tracking-wide bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all"
            isLoading={isSubmitting}
            data-testid="register-submit-btn"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Sivora Account
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
