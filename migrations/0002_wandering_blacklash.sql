DROP INDEX IF EXISTS "phone_number_idx";--> statement-breakpoint
ALTER TABLE "spam_reports" ADD CONSTRAINT "spam_reports_reporter_id_phone_number_pk" PRIMARY KEY("reporter_id","phone_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "phone_number_idx" ON "contacts" USING btree ("phone_number");--> statement-breakpoint
ALTER TABLE "spam_reports" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_phone_number_unique" UNIQUE("phone_number");--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_email_unique" UNIQUE("email");