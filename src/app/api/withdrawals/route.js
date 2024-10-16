import { connectToDatabase } from "../../../../lib/db";

export async function GET() {
  const client = await connectToDatabase();

  try {
    const result = await client.query(`
      SELECT w.id, w.amount, w.date, e.name AS employee_name, w.employee_id, w.salary_period, w.check_number
      FROM Withdrawals w
      LEFT JOIN Employees e ON w.employee_id = e.id
      ORDER BY w.date DESC
    `);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: "No withdrawals found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error fetching withdrawals" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request) {
  const { amount, date, employee_id, salary_period, check_number } =
    await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!employee_id || !salary_period) {
      throw new Error("Employee ID and Salary Period are required");
    }

    const formattedSalaryPeriod = `${salary_period}-01`;

    await client.query(
      "INSERT INTO Withdrawals (amount, date, employee_id, salary_period, check_number) VALUES ($1, $2, $3, $4, $5)",
      [amount, date, employee_id, formattedSalaryPeriod, check_number || null] // Add check_number
    );

    await client.query("COMMIT");
    return new Response(JSON.stringify({ message: "Withdrawal added" }), {
      status: 201,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding withdrawal:", error);
    return new Response(JSON.stringify({ error: "Error adding withdrawal" }), {
      status: 500,
    });
  } finally {
    client.release();
  }
}

export async function DELETE(request) {
  const { id, employee_id, amount } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    // Check if required fields are provided
    if (!id || !employee_id || !amount) {
      throw new Error("ID, employee ID, and amount are required");
    }

    console.log("Deleting withdrawal with ID:", id, "Employee ID:", employee_id, "Amount:", amount);

    // Delete the withdrawal
    const deleteResult = await client.query(
      "DELETE FROM Withdrawals WHERE id = $1 AND employee_id = $2",
      [id, employee_id]
    );

    // Check if the withdrawal was actually deleted
    if (deleteResult.rowCount === 0) {
      throw new Error(`No withdrawal found with ID ${id} for employee ${employee_id}`);
    }

    console.log("Withdrawal deleted, updating SalaryAccount...");

    // Adjust the SalaryAccount
    const updateResult = await client.query(
      "UPDATE SalaryAccount SET total_withdrawn = total_withdrawn - $1, remaining_salary = total_salary - (total_withdrawn - $1) WHERE employee_id = $2",
      [amount, employee_id]
    );

    // Check if SalaryAccount was updated
    if (updateResult.rowCount === 0) {
      throw new Error(`No SalaryAccount found for employee ${employee_id}`);
    }

    await client.query("COMMIT");

    console.log("SalaryAccount updated successfully.");

    return new Response(
      JSON.stringify({
        message: "Withdrawal deleted and salary account updated",
      }),
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error deleting withdrawal:", error);
    return new Response(
      JSON.stringify({
        error: `Error deleting withdrawal and updating salary account: ${error.message}`,
      }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}


export async function PUT(request) {
  const {
    id,
    amount,
    date,
    employee_id,
    old_amount,
    salary_period,
    check_number,
  } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    // Ensure salary_period has a full date by appending "-01"
    const formattedSalaryPeriod = `${salary_period}-01`;

    // Update the withdrawal record in the "Withdrawals" table
    await client.query(
      "UPDATE Withdrawals SET amount = $1, date = $2, salary_period = $5, check_number = $6 WHERE id = $3 AND employee_id = $4",
      [
        amount,
        date,
        id,
        employee_id,
        formattedSalaryPeriod,
        check_number || null,
      ]
    );

    // Adjust the SalaryAccount by subtracting the old withdrawal amount and adding the new amount
    await client.query(
      "UPDATE SalaryAccount SET total_withdrawn = total_withdrawn - $1 + $2, remaining_salary = total_salary - (total_withdrawn - $1 + $2) WHERE employee_id = $3 AND salary_period = $4",
      [old_amount, amount, employee_id, formattedSalaryPeriod]
    );

    await client.query("COMMIT");
    return new Response(
      JSON.stringify({ message: "Withdrawal and salary account updated" }),
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating withdrawal and salary account:", error);
    return new Response(
      JSON.stringify({ error: "Error updating withdrawal and salary account" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
