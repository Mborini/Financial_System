import { connectToDatabase } from "../../../../lib/db";

export async function GET() {
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "costsTypes" table
    const result = await client.query(
      "SELECT costsTypes.*, suppliers.name AS supplier_name FROM costsTypes INNER JOIN suppliers ON costsTypes.supplier = suppliers.id ORDER BY costsTypes.id DESC;"
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: "No cost types found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching costs:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching cost types" }),
      { status: 500 }
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
}

export async function POST(request) {
  const { name, description, supplier } = await request.json();

  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Insert a new cost type record into the "costsTypes" table
    await client.query(
      "INSERT INTO costsTypes (name ,description,supplier) VALUES ($1, $2, $3)",
      [name, description, supplier]
    );
    return new Response(JSON.stringify({ message: "Cost type added" }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error adding cost type:", error);
    return new Response(JSON.stringify({ error: "Error adding cost type" }), {
      status: 500,
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}

export async function PUT(request) {
  const { id, name, description,supplier } = await request.json();
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool
  try {
    // Update an existing cost type record in the "costsTypes" table
    await client.query(
      "UPDATE costsTypes SET name = $1,supplier=$2, description = $3 WHERE id = $4",
      [name,supplier, description, id]
    );

    return new Response(JSON.stringify({ message: "Cost type updated" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating cost type:", error);
    return new Response(JSON.stringify({ error: "Error updating cost type" }), {
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
    // Delete a cost type record from the "costsTypes" table
    await client.query("DELETE FROM costsTypes WHERE id = $1", [id]);
    return new Response(JSON.stringify({ message: "Cost type deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting cost type:", error);
    return new Response(JSON.stringify({ error: "Error deleting cost type" }), {
      status: 500,
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
