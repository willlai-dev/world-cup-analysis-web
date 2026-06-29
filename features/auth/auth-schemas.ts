import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
  password: z.string().min(1, '請輸入密碼'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
    displayName: z.string().min(2, '顯示名稱至少 2 個字'),
    password: z.string().min(8, '密碼至少 8 個字元'),
    confirmPassword: z.string().min(1, '請再次輸入密碼'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const adminCreateUserSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
  displayName: z.string().min(2, '顯示名稱至少 2 個字'),
  password: z.string().min(8, '密碼至少 8 個字元'),
  role: z.enum(['USER', 'PREMIUM', 'ADMIN']),
});

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;

export const profileSchema = z.object({
  displayName: z.string().min(2, '顯示名稱至少 2 個字'),
  nickname: z.string().max(40, '暱稱過長').optional().or(z.literal('')),
  bio: z.string().max(300, '簡介過長').optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
