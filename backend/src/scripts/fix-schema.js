// src/scripts/fix-schema.mjs
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

async function fixSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Fixing schema...');

    // Drop and recreate columns
    await pool.query(`
      ALTER TABLE applicants 
      DROP COLUMN IF EXISTS has_paid_cv CASCADE,
      DROP COLUMN IF EXISTS bachs_checkout_id CASCADE,
      DROP COLUMN IF EXISTS bachs_charge_id CASCADE,
      DROP COLUMN IF EXISTS paid_at CASCADE
    `);
    console.log('Dropped existing columns');

    await pool.query(`
      ALTER TABLE applicants 
      ADD COLUMN has_paid_cv BOOLEAN DEFAULT false,
      ADD COLUMN bachs_checkout_id TEXT,
      ADD COLUMN bachs_charge_id TEXT,
      ADD COLUMN paid_at TIMESTAMP
    `);
    console.log('Added columns with correct types');

    await pool.query(`
      ALTER TABLE applicants 
      ADD CONSTRAINT unique_bachs_checkout_id UNIQUE (bachs_checkout_id),
      ADD CONSTRAINT unique_bachs_charge_id UNIQUE (bachs_charge_id)
    `);
    console.log('Added constraints');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_applicants_has_paid_cv ON applicants(has_paid_cv);
      CREATE INDEX IF NOT EXISTS idx_applicants_bachs_checkout_id ON applicants(bachs_checkout_id);
      CREATE INDEX IF NOT EXISTS idx_applicants_user_id ON applicants(user_id);
    `);
    console.log('Added indexes');

    console.log('Schema fixed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixSchema();