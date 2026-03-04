CREATE TYPE "public"."sub_repayment_status" AS ENUM('PAID', 'FAILED', 'PENDING');--> statement-breakpoint
ALTER TYPE "public"."repayment_status" ADD VALUE 'PARTIAL' BEFORE 'FAILED';--> statement-breakpoint
CREATE TABLE "sub_repayments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repayment_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"paid_at" timestamp,
	"status" "sub_repayment_status" DEFAULT 'PENDING'
);
--> statement-breakpoint
ALTER TABLE "sub_repayments" ADD CONSTRAINT "sub_repayments_repayment_id_repayments_id_fk" FOREIGN KEY ("repayment_id") REFERENCES "public"."repayments"("id") ON DELETE no action ON UPDATE no action;