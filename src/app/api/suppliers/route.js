import { connectToDatabase } from "../../../../lib/db";

export async function GET() {
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "costsTypes" table
    const result = await client.query("SELECT * FROM Suppliers");

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
  const { name, address, phonenumber } = await request.json();
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Insert a new purchase record into the "Purchases" table
    await client.query(
      "INSERT INTO Suppliers (name, address, phonenumber) VALUES ($1, $2, $3)",
      [name, address, phonenumber]
    );
    return new Response(JSON.stringify({ message: "Supplier added" }), {
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
  const { id, name, address, phonenumber } = await request.json();
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Update an existing purchase record in the "Purchases" table
    await client.query(
      "UPDATE Suppliers SET name = $1, address = $2, phonenumber = $3 WHERE id = $4",
      [name, address, phonenumber, id]
    );

    return new Response(JSON.stringify({ message: "Supplier updated" }), {
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

export async function DELETE(request) {
  const { id } = await request.json();
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Delete a purchase record from the "Purchases" table
    await client.query("DELETE FROM Suppliers WHERE id = $1", [id]);
    return new Response(JSON.stringify({ message: "Supplier deleted" }), {
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

