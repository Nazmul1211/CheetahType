# CheetahType Database Setup Instructions

## Overview
This document provides the complete database setup for CheetahType, including all necessary tables, relationships, indexes, and security policies.

## Prerequisites
- Supabase project set up
- Access to SQL Editor in Supabase Dashboard
- Admin/Owner permissions on the Supabase project

## Database Setup Steps

### Step 1: Enable Required Extensions
Execute this SQL in your Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Step 2: Create Tables
Execute the following SQL to create all required tables:

```sql
-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS typing_tests CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users table to store user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Typing tests table to store individual test results
CREATE TABLE typing_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Test configuration
    test_mode TEXT NOT NULL CHECK (test_mode IN ('time', 'words', 'quote', 'zen')),
    time_limit INTEGER, -- in seconds, for time mode
    word_limit INTEGER, -- for words mode
    language TEXT NOT NULL DEFAULT 'english',
    
    -- Test results
    wpm DECIMAL(6,2) NOT NULL,
    raw_wpm DECIMAL(6,2) NOT NULL,
    accuracy DECIMAL(5,4) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1), -- 0 to 1
    consistency DECIMAL(5,4) CHECK (consistency >= 0 AND consistency <= 1), -- 0 to 1, nullable
    
    -- Detailed statistics
    actual_duration INTEGER NOT NULL, -- actual time taken in seconds
    total_characters INTEGER NOT NULL,
    correct_characters INTEGER NOT NULL,
    incorrect_characters INTEGER NOT NULL,
    total_words INTEGER NOT NULL,
    correct_words INTEGER NOT NULL,
    incorrect_words INTEGER NOT NULL,
    
    -- Additional data
    text_content TEXT, -- the text that was typed
    typed_content TEXT, -- what the user actually typed
    error_details JSONB, -- detailed error analysis
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Constraints
    CONSTRAINT valid_time_mode CHECK (
        (test_mode = 'time' AND time_limit IS NOT NULL AND word_limit IS NULL) OR
        (test_mode = 'words' AND word_limit IS NOT NULL AND time_limit IS NULL) OR
        (test_mode IN ('quote', 'zen'))
    ),
    CONSTRAINT valid_characters CHECK (
        total_characters = correct_characters + incorrect_characters
    ),
    CONSTRAINT valid_words CHECK (
        total_words = correct_words + incorrect_words
    )
);

-- User sessions table for tracking user activity
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    session_end TIMESTAMP WITH TIME ZONE,
    tests_completed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    device_info JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Step 3: Create Indexes for Performance
Execute this SQL to create performance indexes:

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_typing_tests_user_id ON typing_tests(user_id);
CREATE INDEX idx_typing_tests_created_at ON typing_tests(created_at);
CREATE INDEX idx_typing_tests_test_mode ON typing_tests(test_mode);
CREATE INDEX idx_typing_tests_wpm ON typing_tests(wpm);
CREATE INDEX idx_typing_tests_accuracy ON typing_tests(accuracy);
CREATE INDEX idx_typing_tests_user_created ON typing_tests(user_id, created_at);
CREATE INDEX idx_typing_tests_mode_time ON typing_tests(test_mode, time_limit) WHERE test_mode = 'time';

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start);
```

### Step 4: Create Useful Views
Execute this SQL to create helpful views:

```sql
-- Create views for easier data access
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.firebase_uid,
    u.email,
    u.display_name,
    COUNT(tt.id) as total_tests,
    ROUND(AVG(tt.wpm), 2) as avg_wpm,
    MAX(tt.wpm) as best_wpm,
    ROUND(AVG(tt.accuracy) * 100, 2) as avg_accuracy,
    MAX(tt.accuracy) as best_accuracy,
    SUM(tt.actual_duration) as total_time_spent,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN typing_tests tt ON u.id = tt.user_id
GROUP BY u.id, u.firebase_uid, u.email, u.display_name, u.created_at, u.last_login_at;

CREATE VIEW leaderboard_view AS
SELECT 
    u.id,
    u.firebase_uid,
    u.display_name,
    u.photo_url,
    tt.wpm,
    tt.accuracy,
    tt.consistency,
    tt.test_mode,
    tt.time_limit,
    tt.language,
    tt.created_at,
    ROW_NUMBER() OVER (
        PARTITION BY tt.test_mode, tt.time_limit 
        ORDER BY tt.wpm DESC, tt.accuracy DESC
    ) as rank
FROM typing_tests tt
JOIN users u ON tt.user_id = u.id
WHERE u.is_active = true;
```

### Step 5: Create Update Triggers
Execute this SQL to create automatic timestamp updates:

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 6: Enable Row Level Security (RLS)
Execute this SQL to set up security policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (firebase_uid = auth.uid()::text);

-- Typing tests policies
CREATE POLICY "Users can view own tests" ON typing_tests
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE firebase_uid = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own tests" ON typing_tests
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE firebase_uid = auth.uid()::text
        )
    );

-- Public read access for leaderboards (optional)
CREATE POLICY "Public leaderboard access" ON typing_tests
    FOR SELECT USING (true);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE firebase_uid = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE firebase_uid = auth.uid()::text
        )
    );
```

### Step 7: Grant Permissions for Service Role
If you're using the service role for API calls, grant necessary permissions:

```sql
-- Grant permissions to service role (if needed)
GRANT ALL ON users TO service_role;
GRANT ALL ON typing_tests TO service_role;
GRANT ALL ON user_sessions TO service_role;
GRANT ALL ON user_stats TO service_role;
GRANT ALL ON leaderboard_view TO service_role;
```

## Data Migration (If Needed)
If you have existing data in a `typing_results` table, you can migrate it:

```sql
-- Example migration from old typing_results table
-- Adjust column names based on your existing schema
INSERT INTO typing_tests (
    user_id,
    test_mode,
    time_limit,
    wpm,
    raw_wpm,
    accuracy,
    actual_duration,
    total_characters,
    correct_characters,
    incorrect_characters,
    total_words,
    correct_words,
    incorrect_words,
    created_at
)
SELECT 
    (SELECT id FROM users WHERE firebase_uid = tr.user_id::text),
    COALESCE(tr.test_mode, 'time'),
    COALESCE(tr.time_limit, 60),
    tr.wpm,
    COALESCE(tr.raw_wpm, tr.wpm),
    tr.accuracy / 100.0, -- Convert percentage to decimal
    COALESCE(tr.actual_duration, tr.time_limit),
    COALESCE(tr.total_characters, 0),
    COALESCE(tr.correct_characters, 0),
    COALESCE(tr.incorrect_characters, 0),
    COALESCE(tr.total_words, 0),
    COALESCE(tr.correct_words, 0),
    COALESCE(tr.incorrect_words, 0),
    tr.created_at
FROM typing_results tr
WHERE EXISTS (SELECT 1 FROM users WHERE firebase_uid = tr.user_id::text);
```

## Verification
After setup, verify everything works:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'typing_tests', 'user_sessions');

-- Check if views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('user_stats', 'leaderboard_view');

-- Test a simple query
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM typing_tests;
```

## Environment Variables
Make sure your environment variables are properly set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Common Issues:
1. **Foreign key constraint errors**: Make sure users exist before creating tests
2. **RLS blocking queries**: Use service role for API calls or adjust policies
3. **Permission denied**: Check if service role has proper permissions
4. **UUID vs text conflicts**: Ensure consistent data types throughout

### Test Your Setup:
1. Try creating a user through the API
2. Try saving a typing test result
3. Check if leaderboard displays data
4. Verify profile page shows user statistics

## Next Steps
After running this setup:
1. Test the save functionality in your application
2. Verify the leaderboard shows data from the new schema
3. Update the profile page to use the new user stats API
4. Consider adding more advanced features like achievements or detailed analytics

## Support
If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify all environment variables are correct
3. Ensure your Supabase project has sufficient permissions
4. Test individual API endpoints with tools like Postman or curl
