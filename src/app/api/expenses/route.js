import { connectToDatabase } from '../../../../lib/db';

export async function GET() {
  const client = await connectToDatabase();  // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "expenses" table
    const result = await client.query('SELECT * FROM expenses');
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return new Response('Error fetching expenses', { status: 500 });
  } finally {
    client.release();  // Release the client back to the pool
  }
}

export async function POST(request) {
  const { amount, description } = await request.json();
  const client = await connectToDatabase();  // Get PostgreSQL client from connection pool

  try {
    // Insert a new expense record into the "expenses" table
    await client.query('INSERT INTO expenses (amount, description) VALUES ($1, $2)', [amount, description]);
    return new Response(JSON.stringify({ message: 'Expense added' }), { status: 201 });
  } catch (error) {
    console.error('Error adding expense:', error);
    return new Response('Error adding expense', { status: 500 });
  } finally {
    client.release();  // Release the client back to the pool
  }
}
