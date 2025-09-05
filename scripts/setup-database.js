import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure dotenv and __dirname for ES modules
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        
        console.log('📖 Reading migration file...');
        const migrationPath = path.join(__dirname, '..', 'migrations', '001_initial_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('🚀 Executing database migration...');
        await client.query(migrationSQL);
        
        console.log('✅ Database setup completed successfully!');
        
        // Test the setup by checking if we can query the sessions table
        console.log('🔍 Testing database setup...');
        const result = await client.query('SELECT COUNT(*) FROM sessions');
        console.log(`✅ Sessions table is working! (${result.rows[0].count} records)`);
        
        // Test PostgREST functions
        console.log('🔧 Testing PostgREST functions...');
        try {
            const testSession = await client.query(`
                SELECT * FROM create_session('test-host', 'agario', 10)
            `);
            console.log('✅ create_session function is working!');
            
            // Clean up test session
            await client.query(`DELETE FROM sessions WHERE room_code = $1`, [testSession.rows[0].room_code]);
            console.log('🧹 Test data cleaned up');
            
        } catch (funcError) {
            console.warn('⚠️  Function test failed:', funcError.message);
        }
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.message.includes('permission denied')) {
            console.log('💡 Make sure your database user has the necessary permissions to:');
            console.log('   - CREATE TYPE');
            console.log('   - CREATE TABLE');
            console.log('   - CREATE FUNCTION');
            console.log('   - CREATE TRIGGER');
        }
        
        if (error.message.includes('does not exist')) {
            console.log('💡 Make sure your DATABASE_URL environment variable is set correctly');
        }
        
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔐 Database connection closed');
    }
}

// Check for required environment variables
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.error('❌ Missing DATABASE_URL or POSTGRES_URL environment variable');
    console.log('💡 Create a .env file with your database connection string:');
    console.log('   DATABASE_URL=postgresql://username:password@host:port/database');
    process.exit(1);
}

// Run the setup
setupDatabase();
