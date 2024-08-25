import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../../index";
import { spamReports, callHistory, contacts } from "../schema";
import { eq, and, inArray } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const spamRoutes = new Hono();

const reportSpamSchema = z.object({
  phoneNumber: z.string().min(1),
});

spamRoutes.use("*", authenticate);

spamRoutes.get("/count/:phoneNumber", async (c) => {
  const { phoneNumber } = c.req.param();
  const AllSpamReports = await db.query.spamReports.findMany({
    where: eq(spamReports.phoneNumber, phoneNumber),
  });

  const spamReportsCount = AllSpamReports.length;

  return c.json({ spamReportsCount });
});

spamRoutes.post("/report", zValidator("json", reportSpamSchema), async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const userId = jwtPayload.userId as number;
  const { phoneNumber } = c.req.valid("json");

  try {
    // Get all contact IDs associated with the user
    const userContacts = await db.query.contacts.findMany({
      where: eq(contacts.userId, userId),
      columns: { id: true },
    });
    const userContactIds = userContacts.map((contact) => contact.id);

    // Find the reported contact
    const reportedContact = await db.query.contacts.findFirst({
      where: eq(contacts.phoneNumber, phoneNumber),
      columns: { id: true },
    });

    if (!reportedContact) {
      return c.json(
        { error: "Reported phone number not found in contacts" },
        404
      );
    }

    // Check if there's been an incoming call from the reported number to any of the user's numbers
    const incomingCall = await db.query.callHistory.findFirst({
      where: and(
        eq(callHistory.callerId, reportedContact.id),
        inArray(callHistory.receiverId, userContactIds)
      ),
    });

    if (!incomingCall) {
      return c.json({ error: "No incoming call found from this number" }, 400);
    }

    // Create the spam report
    const newReport = await db
      .insert(spamReports)
      .values({
        reporterId: userId,
        phoneNumber,
      })
      .returning();

    return c.json({
      message: "Spam report created successfully",
      report: newReport[0],
    });
  } catch (error) {
    console.error("Error creating spam report:", error);
    return c.json({ error: "Failed to create spam report" }, 500);
  }
});

export default spamRoutes;
