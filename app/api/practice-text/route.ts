import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Character frequency and difficulty data
const CHARACTER_DIFFICULTY = {
  // Easy characters (common and comfortable)
  'e': 1, 't': 1, 'a': 1, 'o': 1, 'i': 1, 'n': 1, 's': 1, 'h': 1, 'r': 1,
  'd': 2, 'l': 2, 'c': 2, 'u': 2, 'm': 2, 'w': 2, 'f': 2, 'g': 2, 'y': 2, 'p': 2,
  'b': 3, 'v': 3, 'k': 3, 'j': 3, 'x': 3, 'q': 4, 'z': 4,
  // Numbers
  '1': 2, '2': 2, '3': 2, '4': 3, '5': 3, '6': 3, '7': 3, '8': 3, '9': 3, '0': 3,
  // Common punctuation
  ',': 2, '.': 2, '!': 3, '?': 3, ';': 4, ':': 4, "'": 3, '"': 4,
  // Special characters
  '(': 4, ')': 4, '[': 5, ']': 5, '{': 5, '}': 5, '-': 3, '_': 4, '=': 4, '+': 4,
  '*': 4, '&': 5, '%': 5, '$': 4, '#': 4, '@': 4, '~': 5, '`': 5,
  '/': 4, '\\': 4, '|': 5, '<': 4, '>': 4
};

const COMMON_WORDS: Record<number, string[]> = {
  1: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'],
  2: ['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'],
  3: ['there', 'would', 'their', 'could', 'other', 'after', 'first', 'never', 'these', 'think', 'where', 'being', 'every', 'great', 'might', 'shall', 'still', 'those', 'under', 'while', 'again', 'place', 'right', 'years', 'before', 'should', 'through'],
  4: ['people', 'before', 'should', 'through', 'another', 'between', 'thought', 'nothing', 'without', 'because', 'something', 'important', 'different', 'following', 'government', 'information', 'development', 'performance', 'understanding'],
  5: ['character', 'practice', 'strength', 'challenge', 'difficulty', 'improvement', 'technology', 'generation', 'communication', 'organization', 'responsibility', 'administration', 'recommendation', 'transformation', 'comprehensive']
};

// POST /api/practice-text - generate custom practice text for a character
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firebase_uid,
      target_character,
      difficulty_level = 1,
      word_count = 50,
      focus_intensity = 'medium' // low, medium, high
    } = body || {};

    if (!firebase_uid || !target_character) {
      return NextResponse.json({ 
        error: 'Missing required fields: firebase_uid, target_character' 
      }, { status: 400 });
    }

    // Get user ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate practice text
    const practiceText = generatePracticeText(target_character, difficulty_level, word_count, focus_intensity);
    const characterFrequency = calculateCharacterFrequency(practiceText, target_character);

    // Save to database
    const { data: savedText, error: saveError } = await supabaseAdmin
      .from('custom_practice_texts')
      .insert({
        user_id: user.id,
        target_character,
        practice_text: practiceText,
        difficulty_level,
        word_count: practiceText.split(' ').length,
        character_frequency: characterFrequency
      })
      .select('*')
      .single();

    if (saveError) {
      console.error('Error saving practice text:', saveError);
      return NextResponse.json({ 
        error: 'Failed to save practice text: ' + saveError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...savedText,
        character_frequency: Math.round(characterFrequency * 10000) / 100 // Convert to percentage
      }
    });

  } catch (e: any) {
    console.error('Practice text API error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to generate practice text' }, { status: 500 });
  }
}

// GET /api/practice-text - get practice texts for a user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');
    const target_character = url.searchParams.get('target_character');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    // Get user ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = supabaseAdmin
      .from('custom_practice_texts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (target_character) {
      query = query.eq('target_character', target_character);
    }

    const { data: practiceTexts, error } = await query;

    if (error) {
      console.error('Error fetching practice texts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: practiceTexts || []
    });

  } catch (e: any) {
    console.error('Error fetching practice texts:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch practice texts' }, { status: 500 });
  }
}

function generatePracticeText(
  targetChar: string, 
  difficultyLevel: number, 
  wordCount: number, 
  focusIntensity: string
): string {
  const intensity = focusIntensity === 'high' ? 0.4 : focusIntensity === 'medium' ? 0.25 : 0.15;
  const targetFrequency = intensity; // Target frequency of the character
  
  let words: string[] = [];
  let currentFreq = 0;
  let attempts = 0;
  const maxAttempts = wordCount * 3;

  while (words.length < wordCount && attempts < maxAttempts) {
    attempts++;
    
    // Choose word difficulty based on level
    const maxDiff = Math.min(difficultyLevel + 1, 5);
    const wordDiff = Math.floor(Math.random() * maxDiff) + 1;
    
    // Get words for this difficulty
    const availableWords = COMMON_WORDS[wordDiff] || COMMON_WORDS[1];
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Check if adding this word helps us reach target frequency
    const wordCharCount = (randomWord.match(new RegExp(targetChar, 'gi')) || []).length;
    const totalChars = words.join(' ').length + randomWord.length + (words.length > 0 ? 1 : 0);
    const totalTargetChars = words.join(' ').split('').filter(c => c.toLowerCase() === targetChar.toLowerCase()).length + wordCharCount;
    const newFreq = totalChars > 0 ? totalTargetChars / totalChars : 0;
    
    // If we're below target frequency, prefer words with target character
    // If we're above, prefer words without target character
    const shouldAdd = currentFreq < targetFrequency ? 
      (wordCharCount > 0 || Math.random() > 0.7) : 
      (wordCharCount === 0 || Math.random() > 0.8);
    
    if (shouldAdd) {
      words.push(randomWord);
      currentFreq = newFreq;
    }
  }

  // Add some specific character practice if frequency is too low
  if (currentFreq < targetFrequency * 0.8) {
    const charWords = generateCharacterSpecificWords(targetChar, Math.ceil(wordCount * 0.2));
    words = [...words.slice(0, Math.floor(words.length * 0.8)), ...charWords, ...words.slice(Math.floor(words.length * 0.8))];
  }

  return words.join(' ');
}

function generateCharacterSpecificWords(targetChar: string, count: number): string[] {
  const charWords: string[] = [];
  const char = targetChar.toLowerCase();
  
  // Common patterns and combinations with the target character
  const patterns = [
    char + 'at', char + 'ed', char + 'er', char + 'ly', char + 'ing',
    'a' + char, 'e' + char, 'i' + char, 'o' + char, 'u' + char,
    char + 'a', char + 'e', char + 'i', char + 'o', char + 'u'
  ];
  
  // Words that commonly contain the character
  const commonCharWords: Record<string, string[]> = {
    's': ['see', 'said', 'just', 'such', 'also', 'still', 'some', 'same', 'seem', 'since'],
    't': ['the', 'that', 'time', 'take', 'tell', 'think', 'than', 'them', 'this', 'turn'],
    'r': ['are', 'right', 'rather', 'really', 'return', 'read', 'remember', 'reason', 'result', 'recent'],
    'n': ['and', 'not', 'now', 'new', 'never', 'need', 'next', 'name', 'number', 'nothing'],
    'l': ['like', 'long', 'look', 'let', 'line', 'little', 'last', 'left', 'level', 'live'],
    'e': ['every', 'even', 'each', 'early', 'end', 'enough', 'example', 'experience', 'ever', 'else'],
    'a': ['and', 'are', 'all', 'any', 'about', 'after', 'also', 'again', 'always', 'another'],
    'o': ['of', 'or', 'on', 'one', 'only', 'other', 'over', 'own', 'open', 'old'],
    'i': ['is', 'in', 'it', 'if', 'into', 'its', 'idea', 'important', 'include', 'interest']
  };
  
  const specificWords = commonCharWords[char] || [];
  
  for (let i = 0; i < count; i++) {
    if (specificWords.length > 0 && Math.random() > 0.5) {
      charWords.push(specificWords[Math.floor(Math.random() * specificWords.length)]);
    } else if (patterns.length > 0) {
      charWords.push(patterns[Math.floor(Math.random() * patterns.length)]);
    } else {
      charWords.push(char + char + char); // Fallback
    }
  }
  
  return charWords;
}

function calculateCharacterFrequency(text: string, character: string): number {
  const chars = text.split('');
  const targetCount = chars.filter(c => c.toLowerCase() === character.toLowerCase()).length;
  return chars.length > 0 ? targetCount / chars.length : 0;
}
