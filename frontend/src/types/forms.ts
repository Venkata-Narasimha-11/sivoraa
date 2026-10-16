import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const phoneOtpSendSchema = z.object({
  phone: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
});

export type PhoneOtpSendFormData = z.infer<typeof phoneOtpSendSchema>;

export const phoneOtpVerifySchema = z.object({
  phone: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  otp: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain digits only'),
});

export type PhoneOtpVerifyFormData = z.infer<typeof phoneOtpVerifySchema>;

export const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters').optional().or(z.literal('')),
    phone_number: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
      .optional()
      .or(z.literal('')),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['customer', 'admin']).optional().default('customer'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  sortBy: z.enum(['featured', 'price-asc', 'price-desc', 'name']).default('featured'),
});

export type ProductFilterFormData = z.infer<typeof productFilterSchema>;

