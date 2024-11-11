import { connectToDatabase } from '../../../../lib/db';

export async function GET() {
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "costsTypes" table
    const result = await client.query('SELECT * FROM Employees WHERE is_deleted = false');

    if (result.rows.length === 0) {
        return new Response(JSON.stringify({ message: 'No employees found' }), { status: 404 });
        }

    return new Response(JSON.stringify(result.rows), { status: 200 });
    }
    catch (error) {
    console.error('Error fetching employees:', error);
    return new Response(JSON.stringify({ error: 'Error fetching employees' }), { status: 500 });
    }
    finally {
    client.release(); // Release the client back to the pool
    }
    }