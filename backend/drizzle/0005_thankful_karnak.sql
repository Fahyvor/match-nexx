CREATE TABLE "cv_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bachs_checkout_id" text,
	"bachs_charge_id" text,
	"amount" text,
	"currency" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cv_payments_bachs_checkout_id_unique" UNIQUE("bachs_checkout_id"),
	CONSTRAINT "cv_payments_bachs_charge_id_unique" UNIQUE("bachs_charge_id")
);
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_recruiter_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cv_payments" ADD CONSTRAINT "cv_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiter_id_recruiters_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE cascade ON UPDATE no action;