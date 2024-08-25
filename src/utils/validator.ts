import { z } from "zod";

export const registerSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email().optional(),
  password: z.string(),
  otp: z.string().optional(),
});

export const loginSchema = z.object({
  phoneNumber: z.string(),
  password: z.string(),
});

export const addContactSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email().optional(),
});

export const updateContactSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateSchema = z.object({
  name: z.string().optional(),
  password: z.string().optional(),
});

export const SearchContactByNameSchema = z.object({
  name: z.string(),
});

export const createHistorySchema = z.object({
  callerPhoneNumber: z.string().min(1),
  receiverPhoneNumber: z.string().min(1),
});

export const getHistorySchema = z.object({
  type: z.enum(["outgoing", "incoming"]),
  limit: z.string().optional(),
  offset: z.string().optional(),
});
