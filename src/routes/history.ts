import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../index";
import { callHistory, contacts } from "../schema";
import { eq, desc, sql } from "drizzle-orm";
import { createHistorySchema, getHistorySchema } from "../utils/validator";
import { authenticate } from "../middlewares/auth";

const historyRoutes = new Hono();

historyRoutes.use("*", authenticate);

historyRoutes.post("/", zValidator("json", createHistorySchema), async (c) => {
  const { callerPhoneNumber, receiverPhoneNumber } = c.req.valid("json");

  try {
    // Find caller and receiver contacts
    let caller = await db.query.contacts.findFirst({
      where: eq(contacts.phoneNumber, callerPhoneNumber),
    });

    if (!caller) {
      // Create new caller contact
      const [contact] = await db
        .insert(contacts)
        .values({
          name: callerPhoneNumber,
          phoneNumber: callerPhoneNumber,
        })
        .returning();

      caller = contact;
    }

    const receiver = await db.query.contacts.findFirst({
      where: eq(contacts.phoneNumber, receiverPhoneNumber),
    });

    // Create new call history entry
    const newEntry = await db
      .insert(callHistory)
      .values({
        callerId: caller.id,
        receiverId: receiver?.id || null,
      })
      .returning();

    return c.json({
      message: "Call history entry created",
      entry: newEntry,
    });
  } catch (error) {
    console.error("Error creating call history entry:", error);
    return c.json({ error: "Failed to create call history entry" }, 500);
  }
});

historyRoutes.get("/", zValidator("query", getHistorySchema), async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const userId = jwtPayload.userId as number;
  const { type, limit, offset } = c.req.valid("query");
  const limitNum = Math.min(parseInt(limit || "10", 10), 100);
  const offsetNum = Math.max(parseInt(offset || "0", 10), 0);

  try {
    const history = await db.query.callHistory.findMany({
      where:
        type === "outgoing"
          ? eq(callHistory.callerId, userId)
          : eq(callHistory.receiverId, userId),
      limit: limitNum,
      offset: offsetNum,
      orderBy: [desc(callHistory.callTime)],
      with: {
        caller: {
          columns: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        receiver: {
          columns: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(callHistory)
      .where(
        type === "outgoing"
          ? eq(callHistory.callerId, userId)
          : eq(callHistory.receiverId, userId)
      );

    return c.json({
      history,
      pagination: {
        total: Number(count),
        limit: limitNum,
        offset: offsetNum,
      },
    });
  } catch (error) {
    console.error("Error retrieving call history:", error);
    return c.json({ error: "Failed to retrieve call history" }, 500);
  }
});
export default historyRoutes;
