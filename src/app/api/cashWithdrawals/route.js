import { connectToDatabase } from "../../../../lib/db"; // Adjust the path as necessary

// Handle GET requests to fetch all cash withdrawals
export async function GET() {
  const client = await connectToDatabase();
  try {
    const result = await client.query('SELECT * FROM "cashWithdrawals"');
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching cash withdrawals:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching cash withdrawals" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    client.release();
  }
}

// Handle POST requests to create a new cash withdrawal
export async function POST(request) {
    const { type, amount, date, notes, checkNumber } = await request.json();

    // Debugging: Log the received values
    console.log({ type, amount, date, notes, checkNumber });

    const client = await connectToDatabase();
    try {
        const queryString = 
            'INSERT INTO "cashWithdrawals" (type, amount, date, notes, "checkNumber") VALUES ($1, $2, $3, $4, $5) RETURNING *';
        
        // Debugging: Log the query string
        console.log("Query String:", queryString);

        const result = await client.query(queryString, [type, amount, date, notes, checkNumber]);
        return new Response(JSON.stringify(result.rows[0]), { status: 201 });
    } catch (error) {
        console.error("Error creating cash withdrawal:", error);
        return new Response(
            JSON.stringify({ error: "Error creating cash withdrawal" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        client.release();
    }
}

  // Handle PUT requests to update an existing cash withdrawal by ID
  export async function PUT(request) {
    const { id, type, amount, date, notes, checkNumber } = await request.json(); // Add checkNumber
    const client = await connectToDatabase();
    try {
      const result = await client.query(
        'UPDATE "cashWithdrawals" SET type = $1, amount = $2, date = $3, notes = $4, "checkNumber" = $5 WHERE id = $6 RETURNING *', // Add checkNumber to query
        [type, amount, date, notes, checkNumber, id]
      );
      
      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: "Cash withdrawal not found" }), { status: 404 });
      }
  
      return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
      console.error("Error updating cash withdrawal:", error);
      return new Response(
        JSON.stringify({ error: "Error updating cash withdrawal" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      client.release();
    }
  }
  

// Handle DELETE requests to delete a cash withdrawal by ID
export async function DELETE(request) {
  const { id } = await request.json();
  const client = await connectToDatabase();
  try {
    const result = await client.query(
      'DELETE FROM "cashWithdrawals" WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "Cash withdrawal not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    console.error("Error deleting cash withdrawal:", error);
    return new Response(
      JSON.stringify({ error: "Error deleting cash withdrawal" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    client.release();
  }
}
