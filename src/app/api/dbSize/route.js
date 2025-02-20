import { connectToDatabase } from "../../../../lib/db";

// Handle GET requests
export async function GET() {
  const client = await connectToDatabase();
  try {
    const result = await client.query(` SELECT pg_size_pretty(pg_database_size('neondb'));
    `);

    return new Response(JSON.stringify(result.rows), { status: 200 });
        
    }
    catch (error) {
    console.error("Error fetching sales:", error);
    return new Response("Error fetching sales", { status: 500 });
    }
    finally {
    client.release();
    }
}

