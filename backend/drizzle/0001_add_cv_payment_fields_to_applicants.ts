// migrations/0001_add_cv_payment_fields.ts
import { sql } from "drizzle-orm";

export async function up(db: any) {
  // Add columns to applicants table
  await db.execute(sql`
    DO $$ 
    BEGIN 
      -- Add has_paid_cv
      BEGIN
        ALTER TABLE applicants ADD COLUMN IF NOT EXISTS has_paid_cv BOOLEAN DEFAULT false;
      EXCEPTION 
        WHEN duplicate_column THEN 
          RAISE NOTICE 'Column has_paid_cv already exists';
      END;
      
      -- Add bachs_checkout_id
      BEGIN
        ALTER TABLE applicants ADD COLUMN IF NOT EXISTS bachs_checkout_id TEXT;
      EXCEPTION 
        WHEN duplicate_column THEN 
          RAISE NOTICE 'Column bachs_checkout_id already exists';
      END;
      
      -- Add bachs_charge_id
      BEGIN
        ALTER TABLE applicants ADD COLUMN IF NOT EXISTS bachs_charge_id TEXT;
      EXCEPTION 
        WHEN duplicate_column THEN 
          RAISE NOTICE 'Column bachs_charge_id already exists';
      END;
      
      -- Add paid_at
      BEGIN
        ALTER TABLE applicants ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
      EXCEPTION 
        WHEN duplicate_column THEN 
          RAISE NOTICE 'Column paid_at already exists';
      END;
    END $$;
  `);

  // Add unique constraints safely
  await db.execute(sql`
    DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE applicants ADD CONSTRAINT unique_bachs_checkout_id UNIQUE (bachs_checkout_id);
      EXCEPTION 
        WHEN duplicate_object THEN 
          RAISE NOTICE 'Constraint unique_bachs_checkout_id already exists';
      END;
      
      BEGIN
        ALTER TABLE applicants ADD CONSTRAINT unique_bachs_charge_id UNIQUE (bachs_charge_id);
      EXCEPTION 
        WHEN duplicate_object THEN 
          RAISE NOTICE 'Constraint unique_bachs_charge_id already exists';
      END;
    END $$;
  `);

  // Add indexes for better performance
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_applicants_has_paid_cv ON applicants(has_paid_cv);
    CREATE INDEX IF NOT EXISTS idx_applicants_bachs_checkout_id ON applicants(bachs_checkout_id);
    CREATE INDEX IF NOT EXISTS idx_applicants_user_id ON applicants(user_id);
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    -- Drop indexes
    DROP INDEX IF EXISTS idx_applicants_user_id;
    DROP INDEX IF EXISTS idx_applicants_bachs_checkout_id;
    DROP INDEX IF EXISTS idx_applicants_has_paid_cv;
    
    -- Drop constraints
    ALTER TABLE applicants 
    DROP CONSTRAINT IF EXISTS unique_bachs_charge_id,
    DROP CONSTRAINT IF EXISTS unique_bachs_checkout_id;
    
    -- Drop columns
    ALTER TABLE applicants 
    DROP COLUMN IF EXISTS has_paid_cv,
    DROP COLUMN IF EXISTS bachs_checkout_id,
    DROP COLUMN IF EXISTS bachs_charge_id,
    DROP COLUMN IF EXISTS paid_at;
  `);
}