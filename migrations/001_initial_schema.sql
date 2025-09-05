-- Create enum types
CREATE TYPE session_status AS ENUM ('waiting', 'playing', 'finished');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id TEXT NOT NULL,
    room_code TEXT NOT NULL UNIQUE,
    game_type TEXT NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 20,
    status session_status NOT NULL DEFAULT 'waiting',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    connection_status connection_status NOT NULL DEFAULT 'connected',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    player_data JSONB DEFAULT '{}'
);

-- Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    placement INTEGER,
    game_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON players(session_id);
CREATE INDEX IF NOT EXISTS idx_game_results_session_id ON game_results(session_id);
CREATE INDEX IF NOT EXISTS idx_game_results_player_id ON game_results(player_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sessions table
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT[] := '{0,1,2,3,4,5,6,7,8,9}';
    result TEXT := '';
    i INTEGER := 0;
    code_exists BOOLEAN := TRUE;
BEGIN
    WHILE code_exists LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || chars[1+random()*(array_length(chars, 1)-1)];
        END LOOP;
        
        SELECT EXISTS(SELECT 1 FROM sessions WHERE room_code = result) INTO code_exists;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to create a new session
CREATE OR REPLACE FUNCTION create_session(
    p_host_id TEXT,
    p_game_type TEXT,
    p_max_players INTEGER DEFAULT 20
)
RETURNS TABLE(session_id UUID, room_code TEXT) AS $$
DECLARE
    new_room_code TEXT;
    new_session_id UUID;
BEGIN
    new_room_code := generate_room_code();
    
    INSERT INTO sessions (host_id, room_code, game_type, max_players)
    VALUES (p_host_id, new_room_code, p_game_type, p_max_players)
    RETURNING id INTO new_session_id;
    
    RETURN QUERY SELECT new_session_id, new_room_code;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to join a session
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
    WHERE session_id = session_record.id AND connection_status = 'connected';
    
    IF player_count >= session_record.max_players THEN
        RAISE EXCEPTION 'Session is full';
    END IF;
    
    -- Add player to session
    INSERT INTO players (session_id, display_name, is_host)
    VALUES (session_record.id, p_display_name, FALSE)
    RETURNING id INTO new_player_id;
    
    RETURN QUERY SELECT session_record.id, new_player_id, FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to get session details
CREATE OR REPLACE FUNCTION get_session_details(p_session_id UUID)
RETURNS TABLE(
    session_id UUID,
    room_code TEXT,
    game_type TEXT,
    max_players INTEGER,
    status session_status,
    settings JSONB,
    player_count BIGINT
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.id,
        s.room_code,
        s.game_type,
        s.max_players,
        s.status,
        s.settings,
        COUNT(p.id) FILTER (WHERE p.connection_status = 'connected')
    FROM sessions s
    LEFT JOIN players p ON s.id = p.session_id
    WHERE s.id = p_session_id
    GROUP BY s.id, s.room_code, s.game_type, s.max_players, s.status, s.settings;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for PostgREST
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
