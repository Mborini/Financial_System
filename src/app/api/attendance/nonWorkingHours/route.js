import { connectToDatabase } from "../../../../../lib/db";

// GET total deduction for non-working hours
export async function GET() {
  const client = await connectToDatabase();

  try {
    const result = await client.query(`
      SELECT 
    SUM(
        CASE 
            WHEN Att.non_working_hours > 0 THEN 
                (CAST(e.salary AS numeric) / 300) * (Att.non_working_hours)
            ELSE 
                0
        END
    ) AS total_deduction_for_non_working_hours
FROM attendance Att
INNER JOIN employees e ON e.id = Att.employee_id
WHERE DATE_TRUNC('month', Att.attendance_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    const total_deduction_for_non_working_hours =
      result.rows[0]?.total_deduction_for_non_working_hours || 0;

    return new Response(
      JSON.stringify({ total_deduction_for_non_working_hours }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching total deduction:", error);
    return new Response(
      JSON.stringify({
        error: "Error fetching total deduction for non-working hours.",
      }),
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
