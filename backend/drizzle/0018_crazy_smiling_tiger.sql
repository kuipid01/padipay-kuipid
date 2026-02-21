ALTER TABLE "bank_accounts" ALTER COLUMN "account_number_masked" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_accounts" ALTER COLUMN "provider" SET DEFAULT 'MANUAL';--> statement-breakpoint
ALTER TABLE "bank_accounts" ALTER COLUMN "account_token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "bank_code" varchar(20);--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "account_number" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "account_name" varchar(255) NOT NULL;