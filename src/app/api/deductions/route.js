import { connectToDatabase } from "../../../../lib/db";

// GET all deductions
export async function GET() {
  const client = await connectToDatabase();

  try {
    const result = await client.query(`
      SELECT d.id, d.amount, d.date, e.name AS employee_name, d.employee_id, d.deduction_type
      FROM Deductions d
      LEFT JOIN Employees e ON d.employee_id = e.id
    `);
    

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: "No deductions found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error fetching deductions" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
export async function POST(request) {
  const { amount, date, employee_id, deduction_type } = await request.json(); // No salary_period needed
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!employee_id || !deduction_type) {
      throw new Error("Employee ID and Deduction Type are required");
    }

    // Insert the deduction into the Deductions table
    await client.query(
      "INSERT INTO Deductions (amount, date, employee_id, deduction_type) VALUES ($1, $2, $3, $4)",
      [amount, date, employee_id, deduction_type]
    );

    // Update SalaryAccount for the employee to reflect the new deduction
    await client.query(
      `UPDATE SalaryAccount 
         SET total_deduction = total_deduction + $1
         WHERE employee_id = $2`,
      [amount, employee_id]
    );

    await client.query("COMMIT");
    return new Response(
      JSON.stringify({ message: "Deduction added and salary account updated" }),
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding deduction and updating salary account:", error);
    return new Response(
      JSON.stringify({
        error: "Error adding deduction and updating salary account",
      }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request) {
  const { id, amount, date, employee_id, old_amount, deduction_type } =
    await request.json(); // No salary_period
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    // Update the deduction in the Deductions table
    await client.query(
      "UPDATE Deductions SET amount = $1, date = $2, deduction_type = $3 WHERE id = $4 AND employee_id = $5",
      [amount, date, deduction_type, id, employee_id]
    );

    // Update the SalaryAccount by adjusting total_deduction
    await client.query(
      `UPDATE SalaryAccount 
         SET total_deduction = total_deduction - $1 + $2
         WHERE employee_id = $3`,
      [old_amount, amount, employee_id]
    );

    await client.query("COMMIT");
    return new Response(
      JSON.stringify({ message: "Deduction and salary account updated" }),
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating deduction and salary account:", error);
    return new Response(
      JSON.stringify({ error: "Error updating deduction and salary account" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request) {
  const { id, employee_id, amount } = await request.json();
  console.log("Deleting deduction with:", { id, employee_id, amount }); // Log the parameters

  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!id || !employee_id || !amount) {
      throw new Error("ID, employee ID, and amount are required");
    }

    // Delete the deduction from the Deductions table
    await client.query(
      "DELETE FROM Deductions WHERE id = $1 AND employee_id = $2",
      [id, employee_id]
    );

    // Adjust the SalaryAccount by subtracting the deduction amount
    await client.query(
      `UPDATE SalaryAccount 
         SET total_deduction = total_deduction - $1
         WHERE employee_id = $2`,
      [amount, employee_id]
    );

    await client.query("COMMIT");
    return new Response(
      JSON.stringify({
        message: "Deduction deleted and salary account updated",
      }),
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Error deleting deduction and updating salary account:",
      error
    );
    return new Response(
      JSON.stringify({
        error: "Error deleting deduction and updating salary account",
      }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
