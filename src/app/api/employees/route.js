import { connectToDatabase } from '../../../../lib/db';

export async function GET() {
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "costsTypes" table
    const result = await client.query('SELECT * FROM Employees');

    if (result.rows.length === 0) {
        return new Response(JSON.stringify({ message: 'No employees found' }), { status: 404 });
        }

    return new Response(JSON.stringify(result.rows), { status: 200 });
    }
    catch (error) {
    console.error('Error fetching employees:', error);
    return new Response(JSON.stringify({ error: 'Error fetching employees' }), { status: 500 });
    }
    finally {
    client.release(); // Release the client back to the pool
    }
    }

    export async function POST(request) {
        const { name, salary } = await request.json();
        const client = await connectToDatabase(); // Get PostgreSQL client from connection pool
    
        try {
            // Start a transaction
            await client.query('BEGIN');
    
            // Insert a new employee record into the "Employees" table
            const employeeResult = await client.query(
                "INSERT INTO Employees (name, salary) VALUES ($1, $2) RETURNING id",
                [name, salary]
            );
    
            // Get the generated employee ID from the Employees table
            const employeeId = employeeResult.rows[0].id;
    
            // Insert the initial data into the SalaryAccount table
            await client.query(
                "INSERT INTO SalaryAccount (employee_id, total_salary, total_withdrawn, remaining_salary) VALUES ($1, $2, 0, $2)",
                [employeeId, salary] // total_withdrawn is 0 initially, remaining_salary = total_salary
            );
    
            // Commit the transaction
            await client.query('COMMIT');
    
            return new Response(JSON.stringify({ message: "Employee added and salary account created" }), {
                status: 201,
            });
        } catch (error) {
            // Rollback in case of any error
            await client.query('ROLLBACK');
            console.error("Error adding employee and salary account:", error);
            return new Response(JSON.stringify({ error: "Error adding employee and salary account" }), {
                status: 500,
            });
        } finally {
            client.release(); // Release the client back to the pool
        }
    }
    

    export async function PUT(request) {
        const { id, name, salary } = await request.json(); // 'id' is the employee ID
        const client = await connectToDatabase();
    
        try {
            // Start a transaction
            await client.query('BEGIN');
    
            // Update the employee's name and salary in the "Employees" table
            await client.query(
                "UPDATE Employees SET name = $1, salary = $2 WHERE id = $3",
                [name, salary, id]
            );
    
            // Update the total salary and remaining salary in the "SalaryAccount" table
            await client.query(
                "UPDATE SalaryAccount SET total_salary = $1, remaining_salary = (total_salary - total_withdrawn) WHERE employee_id = $2",
                [salary, id]
            );
    
            // Commit the transaction
            await client.query('COMMIT');
    
            return new Response(JSON.stringify({ message: "Employee and salary account updated" }), {
                status: 200,
            });
        } catch (error) {
            // Rollback in case of any error
            await client.query('ROLLBACK');
            console.error("Error updating employee and salary account:", error);
            return new Response(JSON.stringify({ error: "Error updating employee and salary account" }), {
                status: 500,
            });
        } finally {
            client.release();
        }
    }
    
    export async function DELETE(request) {
        const { id } = await request.json(); // 'id' is the employee ID
        const client = await connectToDatabase();
    
        try {
            // Start a transaction
            await client.query('BEGIN');
    
            // Delete the record from "SalaryAccount" table first (to maintain referential integrity)
            await client.query("DELETE FROM SalaryAccount WHERE employee_id = $1", [id]);
    
            // Delete the employee from "Employees" table
            await client.query("DELETE FROM Employees WHERE id = $1", [id]);
    
            // Commit the transaction
            await client.query('COMMIT');
    
            return new Response(JSON.stringify({ message: "Employee and salary account deleted" }), {
                status: 200,
            });
        } catch (error) {
            // Rollback in case of any error
            await client.query('ROLLBACK');
            console.error("Error deleting employee and salary account:", error);
            return new Response(JSON.stringify({ error: "Error deleting employee and salary account" }), {
                status: 500,
            });
        } finally {
            client.release();
        }
    }
    
