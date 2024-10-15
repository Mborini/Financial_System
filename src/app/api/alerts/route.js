import { connectToDatabase } from "../../../../lib/db";

// GET /api/attendance
export async function GET() {
    const client = await connectToDatabase();
  
    try {
      const result = await client.query(`
        SELECT a.id, a.employee_id, e.name, a.attendance_date, a.check_in, a.check_out, a.work_hours, a.overtime_hours
        FROM Attendance a
        JOIN Employees e ON a.employee_id = e.id
        where a.check_out is null
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
  