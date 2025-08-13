-- Migration to add punctuation, numbers, and zen test modes
-- Date: 2025-08-14

-- Drop existing constraints
ALTER TABLE public.typing_tests DROP CONSTRAINT IF EXISTS typing_tests_test_mode_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_preferred_test_mode_check;

-- Add new constraints with additional test modes
ALTER TABLE public.typing_tests ADD CONSTRAINT typing_tests_test_mode_check 
    CHECK (test_mode IN ('time', 'words', 'quote', 'custom', 'punctuation', 'numbers', 'zen'));

ALTER TABLE public.users ADD CONSTRAINT users_preferred_test_mode_check 
    CHECK (preferred_test_mode IN ('time', 'words', 'quote', 'custom', 'punctuation', 'numbers', 'zen'));

-- Update any existing NULL preferred_test_mode to 'time'
UPDATE public.users SET preferred_test_mode = 'time' WHERE preferred_test_mode IS NULL;
