import { connectToDatabase } from '../../../../../lib/db';

export async function GET() {
    const client = await connectToDatabase();
    try {
      // Fetch all vacation records along with the employee names
      const result = await client.query(`
        SELECT SUM(daily_salary) AS total_daily_salary
        FROM (
            SELECT v.employee_id,
                   e.name,
                   e.salary,
                   CAST(e.salary AS numeric) / 30 AS daily_salary,
                   COUNT(v.id) AS vacation_count 
            FROM public.vacations v
            INNER JOIN public.employees e ON e.id = v.employee_id
            WHERE DATE_TRUNC('month', v.vacation_date) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY v.employee_id, e.name, e.salary
            HAVING COUNT(v.id) > 4
        ) AS employee_vacations;
      `);
  
      // Check if any results were returned
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ message: 'No total vacations found' }), { status: 404 });
      }
  
      // Extract the total daily salary from the first row
      const totalDailySalary = result.rows[0].total_daily_salary || 0; // Default to 0 if null
  
      return new Response(JSON.stringify({ total_daily_salary: totalDailySalary }), { status: 200 });
    } catch (error) {
      console.error('Error fetching total vacations:', error);
      return new Response(JSON.stringify({ error: 'Error fetching total vacations' }), { status: 500 });
    } finally {
      client.release();
    }
  }
  