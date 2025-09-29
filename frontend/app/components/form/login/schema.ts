import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("This is not a valid email"),
  password: z.string().min(6, "Password has to be more then 6 symbols"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;