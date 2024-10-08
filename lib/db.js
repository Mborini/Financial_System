// import { Pool } from 'pg';

// // Setup PostgreSQL connection
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT || 5432, // Default port for PostgreSQL
// });

// export async function connectToDatabase() {
//   try {
//     const client = await pool.connect();
//     console.log('Connected to PostgreSQL database');
//     return client;
//   } catch (err) {
//     console.error('PostgreSQL connection failed:', err.message);
//     throw new Error('Database connection failed');
//   }
// }
import { Pool } from 'pg';

// Setup PostgreSQL connection using Supabase credentials
const pool = new Pool({
  user: process.env.DB_USER,     // Supabase user
  host: process.env.DB_HOST,     // Supabase host
  database: process.env.DB_NAME, // Supabase database name
  password: process.env.DB_PASS, // Supabase password
  port: process.env.DB_PORT || 5432, // PostgreSQL default port
});

export async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to Supabase PostgreSQL database');
    return client;
  } catch (err) {
    console.error('Supabase PostgreSQL connection failed:', err.message);
    throw new Error('Database connection failed');
  }
}
