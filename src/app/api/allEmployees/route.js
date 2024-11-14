import { connectToDatabase } from '../../../../lib/db';

export async function GET() {
  const client = await connectToDatabase();

  try {
    // Query to fetch non-deleted employees
    const result = await client.query('SELECT * FROM Employees WHERE is_deleted = false');

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No employees found' }), { status: 404 });
    }
    console.log('Employees:', result.rows);
    // Return employees data
    return new Response(JSON.stringify(result.rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching employees:', error);

    // Return error response
    return new Response(JSON.stringify({ error: 'Error fetching employees' }), { status: 500 });
  } finally {
    client.release(); // Release the database client
  }
}
