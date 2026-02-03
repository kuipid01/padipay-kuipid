ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "device_name" varchar(100);--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "browser" varchar(50);--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "os" varchar(50);--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "country" varchar(50);--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "is_current" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "last_active_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "device";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "isActive";