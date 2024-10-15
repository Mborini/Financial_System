import { connectToDatabase } from "../../../../lib/db";

// Fetch all staff food entries


// Fetch all staff food entries
// Fetch all staff food entries with employee names
export async function GET() {
    const client = await connectToDatabase();
    try {
      // Join staff_food with Employees table to fetch employee_name
      const result = await client.query(`
       SELECT sf.*, e.name AS employee_name 
      FROM staff_food sf
      LEFT JOIN Employees e ON sf.employee_id = e.id
      order by sf.date desc
      `);
  
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ message: "No staff food entries found" }), {
          status: 404,
        });
      }
  
        return new Response(JSON.stringify(result.rows), { status: 200 });
    }
    catch (error) {
        console.error("Error fetching staff food entries:", error);
        return new Response(JSON.stringify({ error: "Error fetching staff food entries" }), { status: 500 });
        }
    finally {
        client.release();
    }
}

    
// Add new staff food entry (using employee_id)
export async function POST(request) {
    const { employee_id, date, note, amount } = await request.json();  // Use employee_id
    const client = await connectToDatabase();
  
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO staff_food (employee_id, date, note, amount) VALUES ($1, $2, $3, $4)",
        [employee_id, date, note, amount]  // Store employee_id
      );
      await client.query("COMMIT");
      return new Response(JSON.stringify({ message: "Staff food entry added" }), { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      return new Response(JSON.stringify({ error: "Error adding staff food entry" }), { status: 500 });
    } finally {
      client.release();
    }
  }
// Update staff food entry (using employee_id)
export async function PUT(request) {
  const { id, employee_id, date, note, amount } = await request.json();  // Use employee_id
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE staff_food SET employee_id = $1, date = $2, note = $3, amount = $4 WHERE id = $5",
      [employee_id, date, note, amount, id]  // Update with employee_id
    );
    await client.query("COMMIT");
    return new Response(JSON.stringify({ message: "Staff food entry updated" }), { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return new Response(JSON.stringify({ error: "Error updating staff food entry" }), { status: 500 });
  } finally {
    client.release();
  }
}

// Delete staff food entry
export async function DELETE(request) {
  const { id } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM staff_food WHERE id = $1", [id]);
    await client.query("COMMIT");
    return new Response(JSON.stringify({ message: "Staff food entry deleted" }), { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return new Response(JSON.stringify({ error: "Error deleting staff food entry" }), { status: 500 });
  } finally {
    client.release();
  }
}
