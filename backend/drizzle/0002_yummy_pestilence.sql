ALTER TABLE "applicants" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "portfolio" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "cv_url" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "experience_level" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "salary" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "requirements" text[];--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;