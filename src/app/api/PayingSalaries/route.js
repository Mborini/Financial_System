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
      FROM paying_salaries sf
      LEFT JOIN Employees e ON sf.employee_id = e.id
      order by sf.date desc
      `);

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No staff food entries found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching staff food entries:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching staff food entries" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
// amount: amountToPay,
//             date: selectedDate,
//             note: note,
//             adjustedRemainingSalary: adjustedRemainingSalary,
//             employeeId: selectedEmployee, // Assuming selectedEmployee is the employee's ID
//             finallRemining:adjustedRemainingSalary - amountToPay

// Add a new staff food entry

export async function POST(request) {
  const {
    amount,
    date,
    note,
    adjustedRemainingSalary,
    employeeId,
    finallRemining,
    check_number,
  } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!employeeId) {
      throw new Error("Employee ID is required");
    }

    await client.query(
      "INSERT INTO paying_salaries (paid_amount, date, note, adjusted_remaining_salary, employee_id, finall_remaining,check_number) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        amount,
        date,
        note,
        adjustedRemainingSalary,
        employeeId,
        finallRemining,
        check_number,
      ]
    );

    await client.query("COMMIT");
    return new Response(
      JSON.stringify({ message: "paid_amount entry added" }),
      {
        status: 201,
      }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding ", error);
    return new Response(JSON.stringify({ error: "Error " }), {
      status: 500,
    });
  } finally {
    client.release();
  }
}
// Add this to your API file
export async function PUT(request) {
  const { amount, date, employeeId, finallRemining, note } =
    await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!employeeId) {
      throw new Error("Employee ID is required");
    }

    // Update the record in the database
    await client.query(
      "UPDATE paying_salaries SET paid_amount = $1, date = $2, finall_remaining = $3, note=$4 WHERE employee_id = $5",
      [amount, date, finallRemining, note, employeeId]
    );

    await client.query("COMMIT");
    return new Response(JSON.stringify({ message: "Salary entry updated" }), {
      status: 200,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating salary entry:", error);
    return new Response(
      JSON.stringify({ error: "Error updating salary entry" }),
      {
        status: 500,
      }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request) {
  const { id } = await request.json(); // Expecting an id to be passed in the body
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!id) {
      throw new Error("ID is required to delete a salary entry");
    }

    // Perform the delete operation
    await client.query("DELETE FROM paying_salaries WHERE id = $1", [id]);

    await client.query("COMMIT");
    return new Response(JSON.stringify({ message: "Salary entry deleted" }), {
      status: 200,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting salary entry:", error);
    return new Response(
      JSON.stringify({ error: "Error deleting salary entry" }),
      {
        status: 500,
      }
    );
  } finally {
    client.release();
  }
}
