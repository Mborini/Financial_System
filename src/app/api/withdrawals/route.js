import { connectToDatabase } from "../../../../lib/db";

export async function GET() {
  const client = await connectToDatabase();

  try {
    const result = await client.query(`
      SELECT w.id, w.amount, w.date, e.name AS employee_name, w.employee_id
      FROM Withdrawals w
      LEFT JOIN Employees e ON w.employee_id = e.id
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
    const { amount, date, employee_id, salary_period } = await request.json();
    const client = await connectToDatabase();
  
    try {
      await client.query("BEGIN");
  
      if (!employee_id || !salary_period) {
        throw new Error("Employee ID and Salary Period are required");
      }
  
     // Insert the withdrawal and update the SalaryAccount for a specific salary_period
// Insert the withdrawal and update the SalaryAccount for a specific salary_period
await client.query(
       "INSERT INTO Withdrawals (amount, date, employee_id, salary_period) VALUES ($1, $2, $3, TO_DATE($4, 'YYYY-MM'))",
      [amount, date, employee_id, salary_period]
    );
    
    
  
      // Update the SalaryAccount for the specific salary period (if applicable)
      await client.query(
        `UPDATE SalaryAccount 
         SET total_withdrawn = total_withdrawn + $1, 
             remaining_salary = total_salary - (total_withdrawn + $1) 
         WHERE employee_id = $2 AND salary_period = $3`,
        [amount, employee_id, salary_period]
      );
  
      await client.query("COMMIT");
      return new Response(JSON.stringify({ message: "Withdrawal added" }), { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error adding withdrawal:", error);
      return new Response(JSON.stringify({ error: "Error adding withdrawal" }), { status: 500 });
    } finally {
      client.release();
    }
  }
  

export async function DELETE(request) {
  const { id, employee_id, amount } = await request.json();
  const client = await connectToDatabase();

  try {
    await client.query("BEGIN");

    if (!id || !employee_id || !amount) {
      throw new Error("ID, employee ID, and amount are required");
    }

    // Delete the withdrawal
    await client.query("DELETE FROM Withdrawals WHERE id = $1 AND employee_id = $2", [id, employee_id]);

    // Adjust the SalaryAccount
    await client.query(
      "UPDATE SalaryAccount SET total_withdrawn = total_withdrawn - $1, remaining_salary = total_salary - (total_withdrawn - $1) WHERE employee_id = $2",
      [amount, employee_id]
    );

    await client.query("COMMIT");

    return new Response(JSON.stringify({ message: "Withdrawal deleted and salary account updated" }), { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return new Response(
      JSON.stringify({ error: "Error deleting withdrawal and updating salary account" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

  
  export async function PUT(request) {
    const { id, amount, date, employee_id, old_amount } = await request.json(); // old_amount is required to adjust the total_withdrawn correctly
    const client = await connectToDatabase(); // Get PostgreSQL client from connection pool
  
    try {
      // Start a transaction
      await client.query('BEGIN');
  
      // Update the withdrawal record in the "Withdrawals" table
      await client.query(
        "UPDATE Withdrawals SET amount = $1, date = $2 WHERE id = $3 AND employee_id = $4",
        [amount, date, id, employee_id]
      );
  
      // Adjust the SalaryAccount by subtracting the old withdrawal amount and adding the new amount
      await client.query(
        "UPDATE SalaryAccount SET total_withdrawn = total_withdrawn - $1 + $2, remaining_salary = total_salary - (total_withdrawn - $1 + $2) WHERE employee_id = $3",
        [old_amount, amount, employee_id]
      );
  
      // Commit the transaction
      await client.query('COMMIT');
  
      return new Response(JSON.stringify({ message: "Withdrawal and salary account updated" }), { status: 200 });
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error("Error updating withdrawal and salary account:", error);
      return new Response(JSON.stringify({ error: "Error updating withdrawal and salary account" }), { status: 500 });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
  
