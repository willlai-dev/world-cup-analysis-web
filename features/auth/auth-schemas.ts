import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
  password: z.string().min(1, '請輸入密碼'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Bounds mirror the backend ValidationPipe exactly (contract §5.2–5.4):
// password 8..100, displayName 1..60, nickname<=60, bio<=1000.
const passwordField = z
  .string()
  .min(8, '密碼至少 8 個字元')
  .max(100, '密碼最多 100 個字元');
const displayNameField = z
  .string()
  .min(1, '請輸入顯示名稱')
  .max(60, '顯示名稱最多 60 個字');

export const registerSchema = z
  .object({
    email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
    displayName: displayNameField,
    password: passwordField,
    confirmPassword: z.string().min(1, '請再次輸入密碼'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordField,
    confirmPassword: z.string().min(1, '請再次輸入密碼'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const adminCreateUserSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
  displayName: displayNameField,
  password: passwordField,
  role: z.enum(['USER', 'PREMIUM', 'ADMIN']),
});

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;

export const profileSchema = z.object({
  displayName: displayNameField,
  nickname: z.string().max(60, '暱稱最多 60 個字').optional().or(z.literal('')),
  bio: z.string().max(1000, '簡介最多 1000 個字').optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
