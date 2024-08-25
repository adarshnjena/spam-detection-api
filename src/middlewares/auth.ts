import type { Context, Next } from "hono";
import { jwt } from "hono/jwt";

export const authenticate = jwt({
  secret: process.env.JWT_SECRET!,
});

export async function extractUserId(c: Context, next: Next) {
  const payload = c.get("jwtPayload");
  console.log("payload", payload);
  if (payload && typeof payload === "object" && "userId" in payload) {
    c.set("userId", payload.userId as number);
  } else {
    return c.json({ error: "Invalid token payload" }, 401);
  }
  await next();
}
