import { connectToDatabase } from '../../../../lib/db';

export async function GET() {
  const client = await connectToDatabase();  // Get PostgreSQL client from connection pool

  try {
    // Fetch all sales records from the "sales" table
    const result = await client.query('SELECT * FROM sales order by sale_date desc');//from 
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return new Response('Error fetching sales', { status: 500 });
  } finally {
    client.release();  // Release the client back to the pool
  }
}

export async function POST(request) {
  const { cash_amount, visa_amount, sale_date } = await request.json();

  // Convert amounts to numbers
  const cashAmount = parseFloat(cash_amount);
  const visaAmount = parseFloat(visa_amount);

  // Now safely add the amounts to calculate the total
  const total = cashAmount + visaAmount;

  const client = await connectToDatabase();  // Get PostgreSQL client from connection pool

  try {
    // Insert a new sale record into the "sales" table
    const query = `
      INSERT INTO sales (cash_amount, visa_amount, sale_date, total)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [cashAmount, visaAmount, sale_date, total];
    const result = await client.query(query, values);

    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error('Error adding sale:', error);
    return new Response('Error adding sale', { status: 500 });
  } finally {
    client.release();  // Release the client back to the pool
  }
}

export async function DELETE(request) {
  const { id } = await request.json();
  const client = await connectToDatabase();  // Get PostgreSQL client from connection pool

  try {
    // Delete the sale record from the "sales" table
    await client.query('DELETE FROM sales WHERE id = $1', [id]);
    return new Response(JSON.stringify({ message: 'Sale deleted' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return new Response('Error deleting sale', { status: 500 });
  } finally {
    client.release();  // Release the client back to the pool
  }
}
export async function PUT(request) {
  const { id, cash_amount, visa_amount, sale_date } = await request.json();

  const client = await connectToDatabase();  // Get PostgreSQL client from connection pool

  try {
    // Update the sale record in the "sales" table
    const query = `
      UPDATE sales
      SET cash_amount = $1, visa_amount = $2, sale_date = $3, total = $4
      WHERE id = $5
      RETURNING *;
    `;
    const total = parseFloat(cash_amount) + parseFloat(visa_amount);
    const values = [cash_amount, visa_amount, sale_date, total, id];
    const result = await client.query(query, values);

    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating sale:', error);
    return new Response('Error updating sale', { status: 500 });
  } finally {
    client.release();  // Release the client back to the pool
  }
}
