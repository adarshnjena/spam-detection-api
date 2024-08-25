DROP INDEX IF EXISTS "user_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "contact_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "phone_number_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_name_idx" ON "contacts" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phone_number_idx" ON "contacts" USING gin (to_tsvector('english', "phone_number"));