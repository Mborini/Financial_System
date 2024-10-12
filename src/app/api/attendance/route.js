import { connectToDatabase } from "../../../../lib/db";

// GET /api/attendance
export async function GET() {
  const client = await connectToDatabase();

  try {
    const result = await client.query(`
      SELECT a.id, a.employee_id, e.name, a.attendance_date, a.check_in, a.check_out, a.work_hours, a.overtime_hours
      FROM Attendance a
      JOIN Employees e ON a.employee_id = e.id
      ORDER BY a.attendance_date DESC
    `);

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching attendance" }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST /api/attendance
export async function POST(request) {
  const { employee_id, action, checkInDateTime, checkOutDateTime } =
    await request.json();
  const client = await connectToDatabase();

  if (!employee_id || !action) {
    console.error("Error: Missing required data");
    return new Response(
      JSON.stringify({ error: "Employee ID and action are required" }),
      { status: 400 }
    );
  }

  try {
    await client.query("BEGIN");

    if (action === "check_in") {
      if (!checkInDateTime) {
        console.error("Error: Missing check-in datetime");
        return new Response(
          JSON.stringify({ error: "Check-in datetime is required" }),
          { status: 400 }
        );
      }
      await handleCheckIn(client, employee_id, checkInDateTime);
    } else if (action === "check_out") {
      if (!checkOutDateTime) {
        console.error("Error: Missing check-out datetime");
        return new Response(
          JSON.stringify({ error: "Check-out datetime is required" }),
          { status: 400 }
        );
      }
      await handleCheckOut(client, employee_id, checkOutDateTime);
    } else {
      throw new Error("Invalid action. Must be 'check_in' or 'check_out'.");
    }

    await client.query("COMMIT");
    return new Response(JSON.stringify({ message: `${action} successful` }), {
      status: 200,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in attendance:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing attendance",
        details: error.message,
      }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Handle Employee Check-in
async function handleCheckIn(client, employee_id, checkInDateTime) {
  try {
    const checkInDate = new Date(checkInDateTime);
    await client.query(
      `INSERT INTO Attendance (employee_id, check_in, attendance_date) 
       VALUES ($1, $2, $3)`,
      [employee_id, checkInDate, checkInDate.toISOString().split("T")[0]]
    );
  } catch (error) {
    console.error("Error during check-in:", error);
    throw error;
  }
}

async function handleCheckOut(client, employee_id, checkOutDateTime) {
  try {
    const checkOut = new Date(checkOutDateTime);

    // Find the last open check-in record (where check_out is NULL) for this employee
    const result = await client.query(
      `SELECT id, check_in FROM Attendance 
       WHERE employee_id = $1 AND check_out IS NULL
       ORDER BY check_in DESC LIMIT 1`,
      [employee_id]
    );

    if (result.rows.length === 0) {
      console.error(`No check-in record found for employee ID: ${employee_id}`);
      throw new Error("No open check-in record found for the employee.");
    }

    const { id, check_in } = result.rows[0];
    const workHours = calculateWorkHours(check_in, checkOut);
    const overtimeHours = calculateOvertime(workHours);

// Calculate non-working hours (assuming standard is 8 hours)
const standardHours = 10;
const nonWorkingHours = Math.max(0, standardHours - workHours); // Calculate non-working hours


    // Update the Attendance record
   // Update the Attendance record
await client.query(
  `UPDATE Attendance 
   SET check_out = $1, work_hours = $2, overtime_hours = $3, non_working_hours = $4 
   WHERE id = $5`,
  [checkOut, workHours.toFixed(2), overtimeHours.toFixed(2), nonWorkingHours.toFixed(2), id]
);

  } catch (error) {
    console.error("Error during check-out:", error);
    throw error;
  }
}

// Utility: Calculate work hours
// Utility: Calculate work hours
function calculateWorkHours(check_in, check_out) {
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  
  // Calculate difference in milliseconds and convert to hours
  const hoursDifference = (checkOutDate - checkInDate) / (1000 * 60 * 60); // Convert milliseconds to hours
  return hoursDifference; // Return as decimal hours
}


// Utility: Calculate overtime hours (assuming a standard 8-hour day)
function calculateOvertime(workHours) {
  const standardHours = 10;
  return Math.max(0, workHours - standardHours); // Overtime is any time beyond 8 hours
}
