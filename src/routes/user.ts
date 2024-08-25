import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../../index";
import { users, contacts } from "../schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { registerSchema, loginSchema, updateSchema } from "../utils/validator";
import { authenticate } from "../middlewares/auth";

const userRoutes = new Hono();

userRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const { name, phoneNumber, email, password, otp } = c.req.valid("json");

  const existingContact = await db.query.contacts.findFirst({
    where: eq(contacts.phoneNumber, phoneNumber),
  });

  if (existingContact) {
    if (existingContact.userId !== null) {
      return c.json(
        { error: "Phone number already registered to a user" },
        400
      );
    }

    if (otp !== "0000") {
      return c.json({ error: "Invalid OTP" }, 400);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        name,
        password: hashedPassword,
      })
      .returning();

    if (existingContact) {
      await tx
        .update(contacts)
        .set({ userId: user.id, name })
        .where(eq(contacts.id, existingContact.id));
    } else {
      await tx.insert(contacts).values({
        userId: user.id,
        name,
        phoneNumber,
        email,
      });
    }

    return user;
  });

  const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return c.json({
    data: {
      name: name,
      phoneNumber: phoneNumber,
      email: email,
    },
    token,
  });
});

userRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { phoneNumber, password } = c.req.valid("json");

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.phoneNumber, phoneNumber),
  });

  if (!contact) {
    return c.json({ error: "Phone number not found" }, 404);
  }

  if (contact.userId === null) {
    return c.json({ error: "Phone number not registered" }, 400);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, contact.userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return c.json({ error: "Invalid password" }, 400);
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return c.json({
    data: {
      name: user.name,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
    },
    token,
  });
});

userRoutes.use("*", authenticate);

userRoutes.get("/", async (c) => {
  const { userId } = c.get("jwtPayload");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const Mycontacts = await db.query.contacts.findMany({
    where: eq(contacts.userId, userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    name: user.name,
    contacts: Mycontacts,
  });
});

userRoutes.patch("/", zValidator("json", updateSchema), async (c) => {
  const { userId } = c.get("jwtPayload");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const { name, password } = c.req.valid("json");
  await db.transaction(async (tx) => {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await tx
        .update(users)
        .set({ name, password: hashedPassword })
        .where(eq(users.id, userId));
    } else {
      await tx.update(users).set({ name }).where(eq(users.id, userId));
    }
    await tx.update(contacts).set({ name }).where(eq(contacts.userId, userId));
  });

  return c.json({ message: "User updated successfully" });
});

export default userRoutes;
