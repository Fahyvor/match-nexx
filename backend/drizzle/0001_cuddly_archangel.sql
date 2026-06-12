DROP TABLE "interviews" CASCADE;--> statement-breakpoint
DROP TABLE "job_matches" CASCADE;--> statement-breakpoint
DROP TABLE "job_offers" CASCADE;--> statement-breakpoint
DROP TABLE "user_profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firstName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "years_of_experience" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "educations" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "experiences" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "experiences" DROP COLUMN "updated_at";