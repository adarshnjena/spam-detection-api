import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    userId: integer("user_id").references(() => users.id),
    phoneNumber: varchar("phone_number", { length: 15 }).notNull().unique(),
    email: varchar("email", { length: 255 }).unique(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    nameIdx: index("contact_name_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`
    ),
    phoneNumberIdx: index("phone_number_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.phoneNumber})`
    ),
  })
);

export const spamReports = pgTable(
  "spam_reports",
  {
    reporterId: integer("reporter_id").references(() => users.id),
    phoneNumber: varchar("phone_number", { length: 15 })
      .references(() => contacts.phoneNumber)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    px: primaryKey({ columns: [table.reporterId, table.phoneNumber] }),
    phoneNumberIdx: index("spam_phone_number_idx").on(table.phoneNumber),
  })
);

export const callHistory = pgTable(
  "call_history",
  {
    callerId: integer("caller_id").references(() => contacts.id),
    receiverId: integer("receiver_id").references(() => contacts.id),
    callTime: timestamp("call_time").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.callerId, table.receiverId] }),
      receiverIdx: index("receiver_idx").on(table.receiverId),
    };
  }
);

export const callHistoryRelations = relations(callHistory, ({ one }) => ({
  caller: one(contacts, {
    fields: [callHistory.callerId],
    references: [contacts.id],
  }),
  receiver: one(contacts, {
    fields: [callHistory.receiverId],
    references: [contacts.id],
  }),
}));
