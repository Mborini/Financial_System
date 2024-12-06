import { connectToDatabase } from "../../../../lib/db";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period"); // e.g., '2024-10'
  const client = await connectToDatabase();
  try {
    // Query to fetch data for the different categories
    const queries = [
      // Total Sales
      `SELECT SUM(total) AS totalSales
      FROM sales
      WHERE TO_CHAR(sale_date, 'YYYY-MM') = $1`,
      // Total Deductions
      `SELECT SUM(amount) AS totalDeductions
      FROM deductions
      WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      // Total Staff Food
      `SELECT SUM(amount) AS totalStaffFood
      FROM staff_food
      WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      // Total Purchases
      `SELECT SUM(amount) AS totalPurchases
      FROM purchases
      WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      // Total Costs
      `SELECT SUM(amount) AS totalCosts
      FROM costs
      WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      // Paying Salaries
      `SELECT SUM(paid_amount) AS payingSalaries
      FROM paying_salaries
      WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      // Total Vacation Deductions
      `SELECT SUM(daily_salary) AS total_daily_salary
      FROM (
        SELECT v.employee_id,
               e.name,
               e.salary,
               CAST(e.salary AS numeric) / 30 AS daily_salary,
               COUNT(v.id) AS vacation_count 
        FROM public.vacations v
        INNER JOIN public.employees e ON e.id = v.employee_id
        WHERE DATE_TRUNC('month', v.vacation_date) = DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM'))
        GROUP BY v.employee_id, e.name, e.salary
        HAVING COUNT(v.id) > 4
      ) AS employee_vacations`,
      // Total Non-Working Hours
      `SELECT SUM(
        CASE 
            WHEN Att.non_working_hours > 0 THEN 
                (CAST(e.salary AS numeric) / 300) * (Att.non_working_hours)
            ELSE 
                0
        END
      ) AS total_deduction_for_non_working_hours
      FROM attendance Att
      INNER JOIN employees e ON e.id = Att.employee_id
      WHERE DATE_TRUNC('month', Att.attendance_date) = DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM'))`,
      // Total Payment for Over Time
      `SELECT SUM(CAST(payment_amount AS numeric)) AS totalPaymentAmountForOverTime
      FROM attendance
      WHERE TO_CHAR(attendance_date, 'YYYY-MM') = $1`
    ];
    // Execute all the queries with the period parameter
    const results = await Promise.all(
      queries.map((query) => client.query(query, [period]))
    );
    // Extract results from each query
    const totalSales = results[0].rows[0].totalSales || 0;
    const totalDeductions = results[1].rows[0].totalDeductions || 0;
    const totalStaffFood = results[2].rows[0].totalStaffFood || 0;
    const totalPurchases = results[3].rows[0].totalPurchases || 0;
    const totalCosts = results[4].rows[0].totalCosts || 0;
    const payingSalaries = results[5].rows[0].payingSalaries || 0;
    const totalVacationDeductions = results[6].rows[0].total_daily_salary || 0;
    const totalNonWorkingHours = results[7].rows[0].total_deduction_for_non_working_hours || 0;
    const totalPaymentAmountForOverTime = results[8].rows[0].totalPaymentAmountForOverTime || 0;
   
    const totalSummary =
      totalSales +
      totalVacationDeductions +
      totalDeductions +
      totalNonWorkingHours +
      totalStaffFood - 
      totalPurchases - 
      totalCosts - 
      totalPaymentAmountForOverTime - 
      payingSalaries;
    // Return the detailed result as a JSON response
    return new Response(
      JSON.stringify({
        totalSales,
        totalDeductions,
        totalStaffFood,
        totalPurchases,
        totalCosts,
        payingSalaries,
        totalVacationDeductions,
        totalNonWorkingHours,
        totalPaymentAmountForOverTime,
        totalSummary
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch data", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    client.release(); // Ensure to release the database client after operation
  }
}