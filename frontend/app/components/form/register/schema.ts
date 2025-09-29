import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("This is not a valid email"),
    password: z.string().min(6, "Password has to be more then 6 symbols"),
    password_confirmation: z.string().min(6, "Password has to be more then 6 symbols"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;