CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"applicant_id" uuid,
	"recruiter_id" uuid,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"provider" text DEFAULT 'bachs' NOT NULL,
	"provider_checkout_id" text,
	"provider_charge_id" text,
	"provider_transaction_id" text,
	"provider_event_id" text,
	"failure_reason" text,
	"metadata" jsonb,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_provider_checkout_id_unique" UNIQUE("provider_checkout_id"),
	CONSTRAINT "transactions_provider_charge_id_unique" UNIQUE("provider_charge_id"),
	CONSTRAINT "transactions_provider_transaction_id_unique" UNIQUE("provider_transaction_id"),
	CONSTRAINT "transactions_provider_event_id_unique" UNIQUE("provider_event_id")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recruiter_id_recruiters_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE set null ON UPDATE no action;