import { z } from "zod";

export const quickLoginSchema = z
  .object({
    name: z
      .string({ message: "Enter your name." })
      .trim()
      .min(1, "Enter your name.")
      .max(120, "Name is too long."),
    email: z
      .string({ message: "Enter your email address." })
      .trim()
      .min(1, "Enter your email address.")
      .max(200, "Email address is too long.")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.")
      .transform((value) => value.toLowerCase()),
  })
  .strict();

export type QuickLoginInput = z.infer<typeof quickLoginSchema>;

export const loginSchema = z
  .object({
    email: z
      .string({ message: "Enter your demo email address." })
      .trim()
      .min(1, "Enter your demo email address.")
      .max(200, "Email address is too long.")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.")
      .transform((value) => value.toLowerCase()),
    password: z
      .string({ message: "Enter your demo password." })
      .min(1, "Enter your demo password.")
      .max(200, "Password is too long."),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
