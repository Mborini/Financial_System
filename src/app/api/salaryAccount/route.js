import { connectToDatabase } from "../../../../lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // e.g., '2024-10'

    const client = await connectToDatabase();

    try {
        const result = await client.query(`
            SELECT 
                e.name AS employee_name, 
                CAST(e.salary AS DECIMAL(10, 2)) AS total_salary, 
                COALESCE(w.total_withdrawn, 0) AS total_withdrawn,
                COALESCE(d.total_deduction, 0) AS total_deduction, -- Include total deductions
                COALESCE(sf.total_staff_food, 0) AS total_staff_food,
                COALESCE(a.total_overtime_hours, 0) AS total_overtime_hours,
                COALESCE(v.total_vacations, 0) AS total_vacations, -- Total number of vacations
                (CAST(e.salary AS DECIMAL(10, 2)) - COALESCE(w.total_withdrawn, 0) - COALESCE(d.total_deduction, 0) - COALESCE(sf.total_staff_food, 0)) AS remaining_salary
            FROM Employees e
            -- Aggregate total withdrawals for the employee
            LEFT JOIN (
                SELECT employee_id, SUM(amount) AS total_withdrawn
                FROM Withdrawals
                WHERE TO_CHAR(salary_period, 'YYYY-MM') = $1
                GROUP BY employee_id
            ) w ON e.id = w.employee_id
            -- Aggregate total deductions for the employee
            LEFT JOIN (
                SELECT employee_id, SUM(amount) AS total_deduction
                FROM Deductions
                WHERE TO_CHAR(date, 'YYYY-MM') = $1
                GROUP BY employee_id
            ) d ON e.id = d.employee_id
            -- Aggregate total staff food expenses for the employee
            LEFT JOIN (
                SELECT employee_id, SUM(amount) AS total_staff_food
                FROM staff_food
                WHERE TO_CHAR(date, 'YYYY-MM') = $1
                GROUP BY employee_id
            ) sf ON e.id = sf.employee_id
            -- Aggregate total overtime hours for the employee in the specified period
            LEFT JOIN (
                SELECT employee_id, SUM(overtime_hours) AS total_overtime_hours
                FROM Attendance
                WHERE TO_CHAR(attendance_date, 'YYYY-MM') = $1
                GROUP BY employee_id
            ) a ON e.id = a.employee_id
            -- Count total vacations for the employee in the specified period
            LEFT JOIN (
                SELECT employee_id, COUNT(*) AS total_vacations
                FROM Vacations
                WHERE TO_CHAR(vacation_date, 'YYYY-MM') = $1
                GROUP BY employee_id
            ) v ON e.id = v.employee_id
        `, [period]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ message: "No salary account found for the given period" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error) {
        console.error("Error fetching salary account:", error);

        return new Response(
            JSON.stringify({ error: "Error fetching salary account", details: error.message }),
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
