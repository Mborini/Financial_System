import { connectToDatabase } from "../../../../lib/db";

// GET Purchases
export async function GET() {
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "Purchases" table
    const result = await client.query("SELECT * FROM Purchases");

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: "No purchases found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return new Response(JSON.stringify({ error: "Error fetching purchases" }), {
      status: 500,
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}

export async function POST(request) {
  const { amount, paidAmount, paymentStatus, date, name, supplier } = await request.json();

  // Validate required fields
  if (!amount || !date || !name || !supplier || paidAmount === undefined || !paymentStatus) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const remainingAmount = amount - paidAmount; // Calculate remaining amount

  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Insert a new purchase record into the "Purchases" table
    await client.query(
      "INSERT INTO Purchases (amount, paid_amount, remaining_amount, payment_status, date, name, supplier) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [amount, paidAmount, remainingAmount, paymentStatus, date, name, supplier]
    );
    return new Response(JSON.stringify({ message: "Purchase added" }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error adding purchase:", error);
    return new Response(JSON.stringify({ error: "Error adding purchase" }), {
      status: 500,
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
export async function PUT(request) {
  const { id, amount, paidAmount, paymentStatus, date, name, supplier } = await request.json();

  if (!id || !amount || !paidAmount || !paymentStatus || !date || !name || !supplier) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const remainingAmount = amount - paidAmount; // Calculate remaining amount

  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Update the purchase record in the "Purchases" table
    const result = await client.query(
      "UPDATE Purchases SET amount = $1, paid_amount = $2, remaining_amount = $3, payment_status = $4, date = $5, name = $6, supplier = $7 WHERE id = $8",
      [amount, paidAmount, remainingAmount, paymentStatus, date, name, supplier, id]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ message: "Purchase not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "Purchase updated" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return new Response(JSON.stringify({ error: "Error updating purchase" }), {
      status: 500,
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}


  
// DELETE Purchase
export async function DELETE(request) {
  const { id } = await request.json();

  // Validate required field
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing purchase id" }), {
      status: 400,
    });
  }

  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Delete an existing purchase record from the "Purchases" table
    const result = await client.query("DELETE FROM Purchases WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ message: "Purchase not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "Purchase deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return new Response(JSON.stringify({ error: "Error deleting purchase" }), {
      status: 500,
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
