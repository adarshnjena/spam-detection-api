ALTER TABLE "call_history" RENAME COLUMN "caller" TO "caller_id";--> statement-breakpoint
ALTER TABLE "call_history" RENAME COLUMN "receiver" TO "receiver_id";--> statement-breakpoint
DROP INDEX IF EXISTS "receiver_idx";--> statement-breakpoint
ALTER TABLE "call_history" DROP CONSTRAINT "call_history_caller_receiver_pk";--> statement-breakpoint
ALTER TABLE "call_history" ALTER COLUMN "caller_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "call_history" ALTER COLUMN "caller_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "call_history" ALTER COLUMN "receiver_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "call_history" ALTER COLUMN "receiver_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_caller_id_receiver_id_pk" PRIMARY KEY("caller_id","receiver_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_history" ADD CONSTRAINT "call_history_caller_id_contacts_id_fk" FOREIGN KEY ("caller_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "call_history" ADD CONSTRAINT "call_history_receiver_id_contacts_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "receiver_idx" ON "call_history" USING btree ("receiver_id");