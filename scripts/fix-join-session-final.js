import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixJoinSessionFinal() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        
        console.log('🔧 Fixing join_session function with different return names...');
        
        const fixSQL = `
CREATE OR REPLACE FUNCTION join_session(
    p_room_code TEXT,
    p_display_name TEXT
)
RETURNS TABLE(session_id UUID, player_id UUID, is_host BOOLEAN) AS $$
DECLARE
    session_record RECORD;
    new_player_id UUID;
    player_count INTEGER;
BEGIN
    -- Get session info
    SELECT id, host_id, max_players, status INTO session_record
    FROM sessions 
    WHERE room_code = p_room_code;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found with room code: %', p_room_code;
    END IF;
    
    IF session_record.status != 'waiting' THEN
        RAISE EXCEPTION 'Session is not accepting new players';
    END IF;
    
    -- Check if session is full
    SELECT COUNT(*) INTO player_count 
    FROM players 
    WHERE players.session_id = session_record.id AND connection_status = 'connected';
    
    IF player_count >= session_record.max_players THEN
        RAISE EXCEPTION 'Session is full';
    END IF;
    
    -- Add player to session
    INSERT INTO players (session_id, display_name, is_host)
    VALUES (session_record.id, p_display_name, FALSE)
    RETURNING id INTO new_player_id;
    
    -- Use explicit column names to avoid ambiguity
    session_id := session_record.id;
    player_id := new_player_id;
    is_host := FALSE;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
        `;
        
        await client.query(fixSQL);
        
        console.log('✅ join_session function fixed with explicit returns!');
        
        console.log('🔄 Triggering PostgREST schema reload...');
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        
        console.log('✅ Schema reload triggered!');
        
    } catch (error) {
        console.error('❌ Failed to fix join_session:', error.message);
    } finally {
        await client.end();
        console.log('🔐 Database connection closed');
    }
}

fixJoinSessionFinal();
