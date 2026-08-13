CREATE TABLE "cvs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"professional_summary" text,
	"template" text DEFAULT 'minimal',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cvs_applicant_id_unique" UNIQUE("applicant_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"technologies" text[],
	"link" text
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_recruiter_id_recruiters_id_fk";
--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "bachs_checkout_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "bachs_charge_id" text;--> statement-breakpoint
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "paystack_customer_code";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "paystack_subscription_code";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_bachs_checkout_id_unique" UNIQUE("bachs_checkout_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_bachs_charge_id_unique" UNIQUE("bachs_charge_id");