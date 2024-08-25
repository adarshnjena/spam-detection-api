import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../index";
import { contacts, users } from "../schema";
import { authenticate } from "../middlewares/auth";
import { eq } from "drizzle-orm";
import { addContactSchema } from "../utils/validator";
import { primaryKey } from "drizzle-orm/mysql-core";

const contactRoutes = new Hono();

contactRoutes.use("*", authenticate);

contactRoutes.post("/", zValidator("json", addContactSchema), async (c) => {
  const { name, phoneNumber, email } = c.req.valid("json");

  const newContact = await db
    .insert(contacts)
    .values({
      name,
      phoneNumber,
      email,
    })
    .returning();

  return c.json(newContact[0]);
});

contactRoutes.get("/", async (c) => {
  const allContacts = await db.select().from(contacts);
  return c.json(allContacts);
});

contactRoutes.get("/myContacts", async (c) => {
  const { userId } = c.get("jwtPayload");
  const contactsList = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, userId));

  return c.json(contactsList);
});

contactRoutes.post(
  "/myContacts",
  zValidator("json", addContactSchema),
  async (c) => {
    const { userId } = c.get("jwtPayload");
    const { phoneNumber, email } = c.req.valid("json");
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        name: true,
      },
    });

    const name = user?.name || "Unknown";

    const newContact = await db
      .insert(contacts)
      .values({
        name,
        userId,
        phoneNumber,
        email,
      })
      .returning();

    return c.json(newContact[0]);
  }
);

export default contactRoutes;
