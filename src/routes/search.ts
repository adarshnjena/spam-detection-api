import { Hono } from "hono";
import { db } from "../index";
import { contacts } from "../schema";
import { authenticate } from "../middlewares/auth";
import { ilike, sql } from "drizzle-orm";

const searchRoutes = new Hono();

searchRoutes.use("*", authenticate);

searchRoutes.get("/name/:name", async (c) => {
  const { name } = c.req.param();
  console.log("name", name);
  const limit = Math.min(parseInt(c.req.query("limit") || "5", 10), 100); // Default to 5, max 100
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10), 0); // Default to 0, minimum 0

  const result = await db.execute(sql`
    SELECT *
    FROM ${contacts}
    WHERE ${contacts.name} ~* ${name}
  `);

  const matchingContacts = Array.isArray(result) ? result : result.rows || [];

  // Get total count for pagination info
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM ${contacts}
    WHERE ${contacts.name} ~* ${name}
  `);

  console.log("Count result:", countResult);

  const count = Array.isArray(countResult)
    ? countResult[0]?.count
    : countResult.rows?.[0]?.count;

  console.log("Total count:", count);

  return c.json({
    contacts: matchingContacts,
    pagination: {
      total: count,
      limit: limit,
      offset: offset,
      hasMore: offset + matchingContacts.length < count,
    },
  });
});

searchRoutes.get("/phone/:phoneNumber", async (c) => {
  const { phoneNumber } = c.req.param();
  console.log("Searching for phone number:", phoneNumber);
  const limit = Math.min(parseInt(c.req.query("limit") || "5", 10), 100);
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10), 0);

  //remove +
  const removePlus = phoneNumber.replace(/\+/g, "");
  // Prepare the search pattern
  const searchPattern = removePlus.split("").join(".*");

  try {
    // Execute the search query
    const result = await db.execute(sql`
      SELECT *
      FROM ${contacts}
      WHERE ${contacts.phoneNumber} ~* ${searchPattern}
    `);

    console.log("Search result:", result);

    const matchingContacts = Array.isArray(result) ? result : result.rows || [];

    // Get total count for pagination info
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM ${contacts}
      WHERE ${contacts.phoneNumber} ~* ${searchPattern}
    `);

    console.log("Count result:", countResult);

    const count = Array.isArray(countResult)
      ? countResult[0]?.count
      : countResult.rows?.[0]?.count;

    console.log("Total count:", count);

    return c.json({
      contacts: matchingContacts,
      pagination: {
        total: Number(count || 0),
        limit,
        offset,
        hasMore: offset + matchingContacts.length < Number(count || 0),
      },
    });
  } catch (error) {
    console.error("Error searching contacts by phone number:", error);
    return c.json({ error: "An error occurred while searching contacts" }, 500);
  }
});

export default searchRoutes;
