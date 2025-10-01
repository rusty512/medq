import { z } from "zod";

export const identitySchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  // Canadian phone format: 000-000-0000 or (000) 000-0000
  phone: z
    .string()
    .trim()
    .transform((v) => v || "")
    .refine(
      (v) => v === "" || /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4})$/.test(v),
      {
        message: "Format invalide. Ex.: 514-123-4567 ou (514) 123-4567",
      }
    )
    .optional(),
});

export const professionalSchema = z.object({
  speciality: z.string().min(1, "Spécialité requise"),
  ramqId: z
    .string()
    .regex(/^\d{6}$/,{ message: "Identifiant du professionnel (6 chiffres)" }),
});

export const establishmentsSchema = z.object({
  establishments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        type: z.string(),
        isDefault: z.boolean(),
      })
    )
    .min(1, "Au moins un établissement est requis"),
});

export const confirmationSchema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions"
  }),
});

export const onboardingSchema = identitySchema
  .merge(professionalSchema)
  .merge(establishmentsSchema)
  .merge(confirmationSchema);

export type OnboardingValues = {
  firstName: string;
  lastName: string;
  phone?: string;
  speciality: string;
  ramqId: string;
  establishments: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
    isDefault: boolean;
  }>;
  termsAccepted: boolean;
};

export const defaultValues: OnboardingValues = {
  firstName: "",
  lastName: "",
  phone: "",
  speciality: "",
  ramqId: "",
  establishments: [],
  termsAccepted: false,
};

export const stepFieldMap: Record<number, (keyof OnboardingValues)[]> = {
  1: ["firstName", "lastName", "phone"],
  2: ["speciality", "ramqId"],
  3: ["establishments"],
  4: ["termsAccepted"],
};


