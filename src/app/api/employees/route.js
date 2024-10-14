import { connectToDatabase } from '../../../../lib/db';

export async function GET() {
  const client = await connectToDatabase(); // Get PostgreSQL client from connection pool

  try {
    // Fetch all records from the "costsTypes" table
    const result = await client.query('SELECT * FROM Employees WHERE status = TRUE');

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
        const { name, salary, contract_start_date, contract_end_date } = await request.json();
        const client = await connectToDatabase();
    
        try {
            await client.query('BEGIN');
    
            // Insert a new employee with contract start and end dates
            const employeeResult = await client.query(
                `INSERT INTO Employees (name, salary, contract_start_date, contract_end_date) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [name, salary, contract_start_date, contract_end_date]
            );
    
            const employeeId = employeeResult.rows[0].id;
    
            // Insert the initial data into the SalaryAccount table
            await client.query(
                `INSERT INTO SalaryAccount (employee_id, total_salary, total_withdrawn, remaining_salary) 
                 VALUES ($1, $2, 0, $2)`,
                [employeeId, salary]
            );
    
            await client.query('COMMIT');
    
            return new Response(JSON.stringify({ message: "Employee added and salary account created" }), {
                status: 201,
            });
        } catch (error) {
            await client.query('ROLLBACK');
            return new Response(JSON.stringify({ error: "Error adding employee" }), { status: 500 });
        } finally {
            client.release();
        }
    }
    

    export async function PUT(request) {
        const { id, name, salary, contract_start_date, contract_end_date, status } = await request.json(); // Include status in request body
        const client = await connectToDatabase();
    
        try {
            // Start a transaction
            await client.query('BEGIN');
    
            // Check if any fields to update are provided
            if (name || salary || contract_start_date || contract_end_date) {
                // Update employee details if provided
                await client.query(
                    `UPDATE Employees 
                     SET name = COALESCE($1, name), 
                         salary = COALESCE($2, salary), 
                         contract_start_date = COALESCE($3, contract_start_date), 
                         contract_end_date = COALESCE($4, contract_end_date) 
                     WHERE id = $5`,
                    [name, salary, contract_start_date, contract_end_date, id]
                );
    
                // If salary is updated, adjust the SalaryAccount table
                if (salary) {
                    await client.query(
                        `UPDATE SalaryAccount 
                         SET total_salary = $1, remaining_salary = (total_salary - total_withdrawn) 
                         WHERE employee_id = $2`,
                        [salary, id]
                    );
                }
            }
    
            // Update employee status if provided
            if (typeof status !== 'undefined') {
                await client.query(
                    `UPDATE Employees 
                     SET status = $1 
                     WHERE id = $2`,
                    [status, id]
                );
            }
    
            // Commit the transaction
            await client.query('COMMIT');
    
            return new Response(JSON.stringify({ message: "Employee updated successfully" }), { status: 200 });
        } catch (error) {
            // Rollback in case of any error
            await client.query('ROLLBACK');
            console.error("Error updating employee:", error);
            return new Response(JSON.stringify({ error: "Error updating employee" }), { status: 500 });
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
    
  