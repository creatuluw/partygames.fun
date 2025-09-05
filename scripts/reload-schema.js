import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function reloadSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        
        console.log('🔄 Triggering PostgREST schema reload...');
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        
        console.log('✅ Schema reload signal sent!');
        console.log('💡 PostgREST should pick up the new schema within a few seconds.');
        
    } catch (error) {
        console.error('❌ Failed to reload schema:', error.message);
    } finally {
        await client.end();
        console.log('🔐 Database connection closed');
    }
}

reloadSchema();
