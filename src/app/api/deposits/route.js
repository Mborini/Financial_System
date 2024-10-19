import { connectToDatabase } from "../../../../lib/db";

// Function to handle GET requests for fetching deposits
export async function GET() {
    const client = await connectToDatabase();
    try {
        const result = await client.query(`SELECT * FROM deposits ORDER BY date DESC`);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ message: "No deposits found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error) {
        console.error("Error fetching deposits:", error);
        return new Response(JSON.stringify({ error: "Error fetching deposits" }), { status: 500 });
    } finally {
        client.release();
    }
}

// Function to handle POST requests for creating a new deposit
export async function POST(request) {
    const client = await connectToDatabase();
    const { date, amount, note, place, is_hand_handing, name_handler } = await request.json();

    try {
        const result = await client.query(
            `INSERT INTO deposits (date, amount, note, place, is_hand_handing, name_handler) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [date, amount, note, place, is_hand_handing, name_handler]
        );

        return new Response(JSON.stringify(result.rows[0]), { status: 201 });
    } catch (error) {
        console.error("Error creating deposit:", error);
        return new Response(JSON.stringify({ error: "Error creating deposit" }), { status: 500 });
    } finally {
        client.release();
    }
}

// Function to handle PUT requests for updating an existing deposit
export async function PUT(request) {
    const client = await connectToDatabase();
    const { id, date, amount, note, place, is_hand_handing, name_handler } = await request.json();

    try {
        const result = await client.query(
            `UPDATE deposits 
            SET date = $1, amount = $2, note = $3, place = $4, is_hand_handing = $5, name_handler = $6 
            WHERE id = $7 RETURNING *`,
            [date, amount, note, place, is_hand_handing, name_handler, id]
        );

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ message: "Deposit not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
        console.error("Error updating deposit:", error);
        return new Response(JSON.stringify({ error: "Error updating deposit" }), { status: 500 });
    } finally {
        client.release();
    }
}

// Function to handle DELETE requests for removing a deposit
export async function DELETE(request) {
    const client = await connectToDatabase();
    const { id } = await request.json();

    try {
        const result = await client.query(
            `DELETE FROM deposits WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ message: "Deposit not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Deposit deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error deleting deposit:", error);
        return new Response(JSON.stringify({ error: "Error deleting deposit" }), { status: 500 });
    } finally {
        client.release();
    }
}
