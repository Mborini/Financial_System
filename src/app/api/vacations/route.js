// api/vacations.js
import { connectToDatabase } from '../../../../lib/db';

// GET all vacations with employee names
export async function GET() {
  const client = await connectToDatabase();
  try {
    // Fetch all vacation records along with the employee names
    const result = await client.query(`
      SELECT v.id, v.vacation_date, v.created_at, e.name as employee_name, v.employee_id
FROM Vacations v
INNER JOIN Employees e ON v.employee_id = e.id;

    `);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No vacations found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching vacations:', error);
    return new Response(JSON.stringify({ error: 'Error fetching vacations' }), { status: 500 });
  } finally {
    client.release();
  }
}

// POST a new vacation
export async function POST(request) {
  const { employee_id, vacation_date } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO Vacations (employee_id, vacation_date) VALUES ($1, $2) RETURNING id',
      [employee_id, vacation_date]
    );
    await client.query('COMMIT');
    return new Response(JSON.stringify({ message: 'Vacation added successfully' }), { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding vacation:', error);
    return new Response(JSON.stringify({ error: 'Error adding vacation' }), { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE a vacation
export async function DELETE(request) {
  const { id } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM Vacations WHERE id = $1', [id]);
    await client.query('COMMIT');
    return new Response(JSON.stringify({ message: 'Vacation deleted successfully' }), { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting vacation:', error);
    return new Response(JSON.stringify({ error: 'Error deleting vacation' }), { status: 500 });
  } finally {
    client.release();
  }
}
