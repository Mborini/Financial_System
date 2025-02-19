
// import { Pool } from 'pg';

// // Setup PostgreSQL connection using Supabase credentials
// const pool = new Pool({
//   user: process.env.DB_USER,     // Supabase user
//   host: process.env.DB_HOST,     // Supabase host
//   database: process.env.DB_NAME, // Supabase database name
//   password: process.env.DB_PASS, // Supabase password
//   port: process.env.DB_PORT || 5432, // PostgreSQL default port
// });

// export async function connectToDatabase() {
//   try {
//     const client = await pool.connect();
//     console.log('Connected to Supabase PostgreSQL database');
//     return client;
//   } catch (err) {
//     console.error('Supabase PostgreSQL connection failed:', err.message);
//     throw new Error('Database connection failed');
//   }
// }



import { Pool } from 'pg';

// Setup PostgreSQL connection using Neon DB credentials
const pool = new Pool({
  user: process.env.DB_USER,     // Neon DB user
  host: process.env.DB_HOST,     // Neon DB host
  database: process.env.DB_NAME, // Neon DB database name
  password: process.env.DB_PASS, // Neon DB password
  port: process.env.DB_PORT || 5432, // PostgreSQL default port
  ssl: { rejectUnauthorized: false }, // Add SSL option for Neon DB
});

export async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to Neon DB PostgreSQL database');
    return client;
  } catch (err) {
    console.error('Neon DB PostgreSQL connection failed:', err.message);
    throw new Error('Database connection failed');
  }
}
