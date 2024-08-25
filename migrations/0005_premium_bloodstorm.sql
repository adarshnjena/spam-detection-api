DO $$ BEGIN
 ALTER TABLE "spam_reports" ADD CONSTRAINT "spam_reports_phone_number_contacts_phone_number_fk" FOREIGN KEY ("phone_number") REFERENCES "public"."contacts"("phone_number") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
