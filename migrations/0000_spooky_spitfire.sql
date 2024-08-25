CREATE TABLE IF NOT EXISTS "call_history" (
	"caller" varchar(15) NOT NULL,
	"receiver" varchar(15) NOT NULL,
	"call_time" timestamp DEFAULT now(),
	CONSTRAINT "call_history_caller_receiver_pk" PRIMARY KEY("caller","receiver")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"email" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spam_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer,
	"phone_number" varchar(15) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"contact" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "spam_reports" ADD CONSTRAINT "spam_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_contact_contacts_id_fk" FOREIGN KEY ("contact") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "receiver_idx" ON "call_history" USING btree ("receiver");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_name_idx" ON "contacts" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phone_number_idx" ON "contacts" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spam_phone_number_idx" ON "spam_reports" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_name_idx" ON "users" USING btree ("name");