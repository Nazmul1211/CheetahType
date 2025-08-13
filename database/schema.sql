-- CheetahType Database Schema
-- This creates a normalized database structure for the typing test application

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP VIEW IF EXISTS public.leaderboard_view CASCADE;
DROP TABLE IF EXISTS public.typing_tests CASCADE;
DROP TABLE IF EXISTS public.typing_results CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Users table (stores Firebase user information)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL, -- Firebase UID
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- User preferences
    preferred_test_mode TEXT DEFAULT 'time' CHECK (preferred_test_mode IN ('time', 'words', 'quote', 'custom', 'punctuation', 'numbers', 'zen')),
    preferred_time_duration INTEGER DEFAULT 30,
    preferred_words_count INTEGER DEFAULT 25,
    
    -- Statistics (cached for performance)
    total_tests_completed INTEGER DEFAULT 0,
    best_wpm INTEGER DEFAULT 0,
    average_wpm DECIMAL(5,2) DEFAULT 0,
    best_accuracy DECIMAL(5,2) DEFAULT 0,
    average_accuracy DECIMAL(5,2) DEFAULT 0,
    total_time_typed INTEGER DEFAULT 0, -- in seconds
    total_characters_typed INTEGER DEFAULT 0
);

-- 2. Typing Tests table (stores individual test results)
CREATE TABLE public.typing_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Test configuration
    test_mode TEXT NOT NULL CHECK (test_mode IN ('time', 'words', 'quote', 'custom', 'punctuation', 'numbers', 'zen')),
    test_type TEXT DEFAULT 'standard',
    time_limit INTEGER, -- in seconds (for time mode)
    word_limit INTEGER, -- number of words (for words mode)
    
    -- Test content
    text_content TEXT,
    language TEXT DEFAULT 'english',
    
    -- Results
    wpm INTEGER NOT NULL,
    raw_wpm INTEGER,
    accuracy DECIMAL(5,2) NOT NULL,
    consistency DECIMAL(5,2),
    
    -- Character statistics
    total_characters INTEGER NOT NULL,
    correct_characters INTEGER NOT NULL,
    incorrect_characters INTEGER NOT NULL,
    extra_characters INTEGER DEFAULT 0,
    missed_characters INTEGER DEFAULT 0,
    
    -- Time statistics
    actual_duration INTEGER NOT NULL, -- actual time taken in seconds
    backspace_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
    CONSTRAINT valid_consistency CHECK (consistency IS NULL OR (consistency >= 0 AND consistency <= 100)),
    CONSTRAINT valid_wpm CHECK (wpm >= 0 AND wpm <= 1000),
    CONSTRAINT valid_duration CHECK (actual_duration > 0)
);

-- 3. User Sessions table (for analytics and session tracking)
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    tests_in_session INTEGER DEFAULT 0,
    total_time_active INTEGER DEFAULT 0, -- in seconds
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_firebase_uid ON public.users(firebase_uid);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE INDEX idx_typing_tests_user_id ON public.typing_tests(user_id);
CREATE INDEX idx_typing_tests_created_at ON public.typing_tests(created_at);
CREATE INDEX idx_typing_tests_wpm ON public.typing_tests(wpm DESC);
CREATE INDEX idx_typing_tests_accuracy ON public.typing_tests(accuracy DESC);
CREATE INDEX idx_typing_tests_mode_wpm ON public.typing_tests(test_mode, wpm DESC);
CREATE INDEX idx_typing_tests_mode_time ON public.typing_tests(test_mode, time_limit, wpm DESC);
CREATE INDEX idx_typing_tests_user_recent ON public.typing_tests(user_id, created_at DESC);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_start ON public.user_sessions(session_start);

-- Views for common queries

-- 1. Leaderboard view
CREATE VIEW public.leaderboard_view AS
SELECT 
    tt.id,
    u.firebase_uid,
    u.display_name,
    u.email,
    tt.wpm,
    tt.raw_wpm,
    tt.accuracy,
    tt.consistency,
    tt.test_mode,
    tt.time_limit,
    tt.word_limit,
    tt.total_characters,
    tt.actual_duration,
    tt.created_at,
    ROW_NUMBER() OVER (
        PARTITION BY tt.test_mode, tt.time_limit, tt.word_limit 
        ORDER BY tt.wpm DESC, tt.accuracy DESC, tt.created_at ASC
    ) as rank
FROM public.typing_tests tt
JOIN public.users u ON tt.user_id = u.id
WHERE tt.created_at >= NOW() - INTERVAL '30 days' -- Only last 30 days
ORDER BY tt.wpm DESC, tt.accuracy DESC;

-- 2. User statistics view
CREATE VIEW public.user_stats_view AS
SELECT 
    u.id,
    u.firebase_uid,
    u.display_name,
    u.email,
    COUNT(tt.id) as total_tests,
    ROUND(AVG(tt.wpm)::numeric, 2) as avg_wpm,
    MAX(tt.wpm) as best_wpm,
    ROUND(AVG(tt.accuracy)::numeric, 2) as avg_accuracy,
    MAX(tt.accuracy) as best_accuracy,
    ROUND(AVG(tt.consistency)::numeric, 2) as avg_consistency,
    SUM(tt.actual_duration) as total_time_spent,
    SUM(tt.total_characters) as total_characters_typed,
    MIN(tt.created_at) as first_test_date,
    MAX(tt.created_at) as last_test_date
FROM public.users u
LEFT JOIN public.typing_tests tt ON u.id = tt.user_id
GROUP BY u.id, u.firebase_uid, u.display_name, u.email;

-- 3. Recent tests view (for user profile)
CREATE VIEW public.recent_tests_view AS
SELECT 
    tt.*,
    u.display_name,
    u.email
FROM public.typing_tests tt
JOIN public.users u ON tt.user_id = u.id
ORDER BY tt.created_at DESC;

-- Functions for maintaining user statistics

-- Function to update user statistics after a test
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET 
        total_tests_completed = (
            SELECT COUNT(*) FROM public.typing_tests WHERE user_id = NEW.user_id
        ),
        best_wpm = GREATEST(
            COALESCE(best_wpm, 0),
            NEW.wpm
        ),
        average_wpm = (
            SELECT ROUND(AVG(wpm)::numeric, 2) FROM public.typing_tests WHERE user_id = NEW.user_id
        ),
        best_accuracy = GREATEST(
            COALESCE(best_accuracy, 0),
            NEW.accuracy
        ),
        average_accuracy = (
            SELECT ROUND(AVG(accuracy)::numeric, 2) FROM public.typing_tests WHERE user_id = NEW.user_id
        ),
        total_time_typed = (
            SELECT COALESCE(SUM(actual_duration), 0) FROM public.typing_tests WHERE user_id = NEW.user_id
        ),
        total_characters_typed = (
            SELECT COALESCE(SUM(total_characters), 0) FROM public.typing_tests WHERE user_id = NEW.user_id
        ),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT ON public.typing_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update user's last login
CREATE OR REPLACE FUNCTION update_last_login(firebase_uid TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET last_login_at = NOW()
    WHERE firebase_uid = $1;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (firebase_uid = auth.jwt() ->> 'sub');

-- Users can update their own data
CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (firebase_uid = auth.jwt() ->> 'sub');

-- Users can insert their own typing tests
CREATE POLICY typing_tests_insert_own ON public.typing_tests
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE firebase_uid = auth.jwt() ->> 'sub'
        )
    );

-- Users can read their own typing tests
CREATE POLICY typing_tests_select_own ON public.typing_tests
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE firebase_uid = auth.jwt() ->> 'sub'
        )
    );

-- Public read access for leaderboard (anonymized)
CREATE POLICY leaderboard_public_read ON public.typing_tests
    FOR SELECT USING (true);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.typing_tests TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.user_stats_view TO authenticated;
GRANT SELECT ON public.recent_tests_view TO authenticated;

-- Grant permissions to service role for admin operations
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- =====================================
-- Advanced Analytics Tables
-- =====================================

-- Character performance tracking table
CREATE TABLE IF NOT EXISTS public.character_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES public.typing_tests(id) ON DELETE CASCADE,
    character CHAR(1) NOT NULL,
    total_typed INTEGER NOT NULL DEFAULT 0,
    correct_typed INTEGER NOT NULL DEFAULT 0,
    incorrect_typed INTEGER NOT NULL DEFAULT 0,
    average_speed DECIMAL(8,2) NOT NULL DEFAULT 0.00, -- Characters per minute
    error_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000 CHECK (error_rate >= 0 AND error_rate <= 1),
    difficulty_score DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Calculated difficulty based on position, frequency, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for character performance
CREATE INDEX IF NOT EXISTS idx_character_performance_user_character ON public.character_performance(user_id, character);
CREATE INDEX IF NOT EXISTS idx_character_performance_test ON public.character_performance(test_id);
CREATE INDEX IF NOT EXISTS idx_character_performance_weakness ON public.character_performance(user_id, error_rate DESC, average_speed ASC);

-- Custom practice texts table
CREATE TABLE IF NOT EXISTS public.custom_practice_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_character CHAR(1) NOT NULL,
    practice_text TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    word_count INTEGER NOT NULL DEFAULT 0,
    character_frequency DECIMAL(5,4) NOT NULL DEFAULT 0.0000, -- Frequency of target character in text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for custom practice texts
CREATE INDEX IF NOT EXISTS idx_custom_practice_user_character ON public.custom_practice_texts(user_id, target_character);
CREATE INDEX IF NOT EXISTS idx_custom_practice_difficulty ON public.custom_practice_texts(difficulty_level, character_frequency DESC);

-- User improvement recommendations table
CREATE TABLE IF NOT EXISTS public.improvement_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_character CHAR(1) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('practice', 'technique', 'finger_placement', 'speed', 'accuracy')),
    priority_score DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Higher score = higher priority
    recommendation_text TEXT NOT NULL,
    practice_text_id UUID REFERENCES public.custom_practice_texts(id),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_user_priority ON public.improvement_recommendations(user_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_character ON public.improvement_recommendations(target_character);

-- Grant permissions for new tables
GRANT ALL ON public.character_performance TO authenticated;
GRANT ALL ON public.custom_practice_texts TO authenticated;
GRANT ALL ON public.improvement_recommendations TO authenticated;
GRANT ALL ON public.character_performance TO service_role;
GRANT ALL ON public.custom_practice_texts TO service_role;
GRANT ALL ON public.improvement_recommendations TO service_role;
