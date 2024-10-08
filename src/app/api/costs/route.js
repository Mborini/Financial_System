import { connectToDatabase } from '../../../../lib/db';

// Handle GET requests
export async function GET() {
  const client = await connectToDatabase();
  try {
    const result = await client.query('SELECT * FROM costs');
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return new Response('Error fetching sales', { status: 500 });
  } finally {
    client.release();
  }
}

// POST API to add a new cost
export async function POST(req) {
  const { amount, description, date, name, type } = await req.json();
  const client = await connectToDatabase();

  try {
    const result = await client.query(
      'INSERT INTO costs (amount, description, date, name, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [amount, description, date, name, type]
    );
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error('Error adding new cost:', error);
    return new Response('Error adding new cost', { status: 500 });
  } finally {
    client.release();
  }
}
// PUT API to update a cost by ID
export async function PUT(req) {
  const { id, amount, description, date, name, type } = await req.json();
  const client = await connectToDatabase();

  try {
    const result = await client.query(
      'UPDATE costs SET amount = $1, description = $2, date = $3, name = $4, type = $5 WHERE id = $6 RETURNING *',
      [amount, description, date, name, type, id]
    );

    if (result.rowCount === 0) {
      return new Response('Cost not found', { status: 404 });
    }

    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating cost:', error);
    return new Response('Error updating cost', { status: 500 });
  } finally {
    client.release();
  }
}
// DELETE API to delete a cost by ID
export async function DELETE(req) {
  const { id } = await req.json();
  const client = await connectToDatabase();

  try {
    const result = await client.query('DELETE FROM costs WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return new Response('Cost not found', { status: 404 });
    }
    
    return new Response('Cost deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting cost:', error);
    return new Response('Error deleting cost', { status: 500 });
  } finally {
    client.release();
  }
}
