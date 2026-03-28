ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" varchar NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS "ContactRequest" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50) NOT NULL,
  "message" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
