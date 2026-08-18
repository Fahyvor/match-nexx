ALTER TABLE "cv_payments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cv_payments" CASCADE;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "has_paid_cv" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "bachs_checkout_id" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "bachs_charge_id" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_bachs_checkout_id_unique" UNIQUE("bachs_checkout_id");--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_bachs_charge_id_unique" UNIQUE("bachs_charge_id");