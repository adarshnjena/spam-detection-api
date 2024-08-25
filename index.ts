// src/index.ts
import "dotenv/config";
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./src/schema";

import userRoutes from "./src/routes/user";
import contactRoutes from "./src/routes/contacts";
import searchRoutes from "./src/routes/search";
import spamRoutes from "./src/routes/spam";
import helloworld from "./src/routes/helloworld";
import hostoryRoutes from "./src/routes/history";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Routes
app.route("/api/user", userRoutes);
app.route("/api/contacts", contactRoutes);
app.route("/api/spam", spamRoutes);
app.route("/api/hello", helloworld);
app.route("/api/search", searchRoutes);
app.route("/api/history", hostoryRoutes);

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Start the server

export default {
  fetch: app.fetch,
};
