# Database migration script for PostgREST
$baseUrl = "https://postgrestpostgrest-production-dd5b.up.railway.app"

# Function to execute SQL via PostgREST
function Invoke-SQL {
    param([string]$sql)
    
    try {
        $body = @{
            query = $sql
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-WebRequest -Uri "$baseUrl/rpc/query" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body
            
        Write-Host "✓ SQL executed successfully"
        return $response
    } catch {
        Write-Host "✗ Error executing SQL: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "Starting database migration..."

# Step 1: Create enum types
Write-Host "Creating enum types..."
$enumSql = @"
DO `$`$ BEGIN
    CREATE TYPE session_status AS ENUM ('waiting', 'playing', 'finished');
EXCEPTION
    WHEN duplicate_object THEN null;
END `$`$;

DO `$`$ BEGIN
    CREATE TYPE connection_status AS ENUM ('connected', 'disconnected');
EXCEPTION
    WHEN duplicate_object THEN null;
END `$`$;
"@

# Since PostgREST might not have a direct SQL execution endpoint, let's try a different approach
# Create the tables directly via HTTP requests

Write-Host "Creating sessions table..."
$sessionsBody = @{
    sql = @"
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id TEXT NOT NULL,
    room_code TEXT NOT NULL UNIQUE,
    game_type TEXT NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 20,
    status TEXT NOT NULL DEFAULT 'waiting',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"@
} | ConvertTo-Json

try {
    # Let's try a simpler approach - create tables via direct SQL execution
    # First, let's check what endpoints are available
    Write-Host "Checking available endpoints..."
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "Migration script completed."
