import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// POST /api/tests - insert a test result
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firebase_uid,
      user_email,
      wpm,
      raw_wpm,
      accuracy,
      consistency,
      total_characters,
      correct_characters,
      incorrect_characters,
      total_words,
      correct_words,
      incorrect_words,
      actual_duration,
      test_mode,
      time_limit,
      word_limit,
      language,
      text_content,
    } = body || {};

    if (!firebase_uid || !user_email || typeof wpm !== 'number' || typeof actual_duration !== 'number') {
      console.error('Missing required fields:', { 
        firebase_uid, 
        user_email, 
        wpm: typeof wpm, 
        actual_duration: typeof actual_duration 
      });
      return NextResponse.json({ 
        error: 'Missing required fields: firebase_uid, user_email, wpm, actual_duration' 
      }, { status: 400 });
    }

    // Validate accuracy is in correct range (0-1 decimal format)
    if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1) {
      console.error('Invalid accuracy value:', accuracy);
      return NextResponse.json({ 
        error: 'Accuracy must be a number between 0 and 1' 
      }, { status: 400 });
    }

    // First, ensure the user exists
    let user;
    const { data: existingUser, error: userLookupError } = await supabaseAdmin
      .from('users')
      .select('id, firebase_uid')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userLookupError) {
      if (userLookupError.code === 'PGRST116') {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            firebase_uid,
            email: user_email,
            display_name: user_email.split('@')[0], // Use email prefix as display name
          })
          .select('id, firebase_uid')
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return NextResponse.json({ 
            error: 'Failed to create user: ' + createError.message 
          }, { status: 500 });
        }
        user = newUser;
      } else {
        console.error('Error looking up user:', userLookupError);
        return NextResponse.json({ 
          error: 'Failed to lookup user: ' + userLookupError.message 
        }, { status: 500 });
      }
    } else {
      user = existingUser;
    }

    console.log('Using user:', user);

    // Check for duplicate recent saves to prevent multiple identical saves
    const { data: recentTests, error: duplicateCheckError } = await supabaseAdmin
      .from('typing_tests')
      .select('wpm, accuracy, total_characters, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30000).toISOString()) // Within last 30 seconds
      .order('created_at', { ascending: false })
      .limit(5);

    if (!duplicateCheckError && recentTests && recentTests.length > 0) {
      // Check if we have identical test data in the last 30 seconds
      const isDuplicate = recentTests.some(test => 
        Math.abs(test.wpm - Math.round(wpm)) <= 1 &&
        Math.abs(test.accuracy - accuracy) <= 0.01 && // Compare decimal values directly
        Math.abs(test.total_characters - (total_characters || 0)) <= 5
      );
      
      if (isDuplicate) {
        console.log('Duplicate test detected, skipping save');
        return NextResponse.json({ 
          error: 'Duplicate test result detected. Please wait before saving again.' 
        }, { status: 409 });
      }
    }

    // Calculate derived values if not provided
    const calculatedTotalChars = total_characters || Math.round(wpm * actual_duration / 60 * 5);
    const calculatedCorrectChars = correct_characters || Math.round(calculatedTotalChars * accuracy);
    const calculatedIncorrectChars = incorrect_characters || (calculatedTotalChars - calculatedCorrectChars);
    const calculatedTotalWords = total_words || Math.round(calculatedTotalChars / 5);
    const calculatedCorrectWords = correct_words || Math.round(calculatedCorrectChars / 5);
    const calculatedIncorrectWords = incorrect_words || Math.round(calculatedIncorrectChars / 5);

    // Prepare test data - ensure ALL required fields are present and properly formatted
    const testData = {
      user_id: user.id,
      test_mode: test_mode || 'time',
      time_limit: time_limit,
      word_limit: word_limit,
      text_content: text_content || null,
      wpm: Math.round(wpm), // Convert to INTEGER as expected by database
      raw_wpm: raw_wpm ? Math.round(raw_wpm) : Math.round(wpm * 1.1), // Convert to INTEGER
      accuracy: Math.min(1, Math.max(0, Number(accuracy.toFixed(4)))), // Keep as decimal (0-1) with precision
      consistency: consistency ? Math.min(1, Math.max(0, Number(consistency.toFixed(4)))) : null, // Keep as decimal (0-1) with precision
      total_characters: calculatedTotalChars,
      correct_characters: calculatedCorrectChars,
      incorrect_characters: calculatedIncorrectChars,
      total_words: calculatedTotalWords, // Add the required word fields
      correct_words: calculatedCorrectWords,
      incorrect_words: calculatedIncorrectWords,
      actual_duration: Math.round(actual_duration),
      language: language || 'english'
    };

    // Validate all required numeric fields are present and valid
    const requiredFields = ['wpm', 'raw_wpm', 'accuracy', 'total_characters', 'correct_characters', 'incorrect_characters', 'total_words', 'correct_words', 'incorrect_words', 'actual_duration'];
    for (const field of requiredFields) {
      if (testData[field as keyof typeof testData] === null || testData[field as keyof typeof testData] === undefined || isNaN(Number(testData[field as keyof typeof testData]))) {
        console.error(`Invalid ${field}:`, testData[field as keyof typeof testData]);
        return NextResponse.json({ 
          error: `Invalid ${field} value. Please try again with a new test.` 
        }, { status: 400 });
      }
    }

    console.log('Final test data to insert:', testData);

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('typing_tests')
      .insert(testData)
      .select('id, wpm, accuracy, created_at')
      .single();

    if (insertError) {
      console.error('Error inserting test:', insertError);
      if (insertError.code === '22003') {
        return NextResponse.json({ 
          error: 'Invalid data value detected, please try again with a new test.' 
        }, { status: 400 });
      }
      if (insertError.code === '23502') {
        return NextResponse.json({ 
          error: 'Missing required data. Please try again with a new test.' 
        }, { status: 400 });
      }
      return NextResponse.json({ 
        error: 'Failed to save test result. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: insertData 
    });
  } catch (e: any) {
    console.error('API error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to save test' }, { status: 500 });
  }
}

// GET /api/tests - get tests for a user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');
    const limit = parseInt(url.searchParams.get('limit') || '25');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    // Get user's tests
    const { data: tests, error } = await supabaseAdmin
      .from('typing_tests')
      .select(`
        *,
        users!inner(firebase_uid, display_name, email)
      `)
      .eq('users.firebase_uid', firebase_uid)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching tests:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      tests: tests || [],
      count: tests?.length || 0
    });

  } catch (e: any) {
    console.error('Error fetching tests:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch tests' }, { status: 500 });
  }
}
