import { connectToDatabase } from "../../../../lib/db";
export async function GET(request) {
  // Get the period from the request headers
  const period = request.headers.get('Period');
  // Check if the period is provided
  if (!period) {
    return new Response(
      JSON.stringify({ message: "Period parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = await connectToDatabase();

  try {
    // Define queries for totals
    const queries = [
      `SELECT SUM(total) AS totalSales FROM sales WHERE TO_CHAR(sale_date, 'YYYY-MM') = $1`,
      `SELECT SUM(amount) AS totalDeductions FROM deductions WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      `SELECT SUM(amount) AS totalStaffFood FROM staff_food WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      `SELECT SUM(amount) AS totalPurchases FROM purchases WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      `SELECT SUM(amount) AS totalCosts FROM costs WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      `SELECT SUM(amount) AS totalWithdrawals FROM withdrawals WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      `SELECT SUM(amount) AS totalCashWithdrawals FROM cashwithdrawals WHERE TO_CHAR(date, 'YYYY-MM') = $1;`,
      `SELECT SUM(paid_amount) AS payingSalaries FROM paying_salaries WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      `SELECT SUM((vacation_count - 4) * daily_salary) AS total_daily_salary FROM 
        (SELECT v.employee_id, e.name, e.salary, CAST(e.salary AS numeric) / 30 AS daily_salary, COUNT(v.id) AS vacation_count 
        FROM public.vacations v 
        INNER JOIN public.employees e ON e.id = v.employee_id 
        WHERE DATE_TRUNC('month', v.vacation_date) = DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM')) 
        GROUP BY v.employee_id, e.name, e.salary 
        HAVING COUNT(v.id) > 4) AS employee_vacations`,
      `SELECT SUM(CASE WHEN Att.non_working_hours > 0 THEN (CAST(e.salary AS numeric) / 300) * (Att.non_working_hours) ELSE 0 END) AS total_deduction_for_non_working_hours 
        FROM attendance Att 
        INNER JOIN employees e ON e.id = Att.employee_id 
        WHERE DATE_TRUNC('month', Att.attendance_date) = DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM'))`,
      `SELECT SUM(CAST(payment_amount AS numeric)) AS totalPaymentAmountForOverTime FROM attendance WHERE TO_CHAR(attendance_date, 'YYYY-MM') = $1`
    ];

    // Execute all queries concurrently
    const results = await Promise.all(queries.map(query => client.query(query, [period])));

    // Extract results from the response rows and handle potential errors gracefully
    const totals = results.map((result) => {
      // Default to 0 if result rows are empty or invalid
      const value = result?.rows?.[0] ? Object.values(result.rows[0])[0] : 0;
      return parseFloat(value) || 0;
    });

    const [
      totalSales, totalDeductions, totalStaffFood, totalPurchases, totalCosts, 
      totalWithdrawals, payingSalaries, totalVacationDeductions, 
      totalNonWorkingHours, totalPaymentAmountForOverTime, totalCashWithdrawals
    ] = totals;

    // Calculate total summary
    const totalSummary =
      totalSales + totalVacationDeductions + totalDeductions + totalNonWorkingHours +
      totalStaffFood - totalPurchases - totalCosts - totalPaymentAmountForOverTime - totalCashWithdrawals -
      totalWithdrawals - payingSalaries;

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
        totalWithdrawals,
        totalCashWithdrawals,
        totalSummary,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch data", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (client) {
      client.release(); // Ensure client is released
    }
  }
}
