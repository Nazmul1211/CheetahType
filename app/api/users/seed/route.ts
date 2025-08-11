import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// POST /api/users/seed - create a simple user entry in typing_results to satisfy foreign key
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      email,
    } = body || {};

    if (!user_id || !email) {
      return NextResponse.json({ error: 'Missing required fields: user_id and email' }, { status: 400 });
    }

    // Since we don't have a users table but typing_results has foreign key constraints,
    // we need to check what the constraint is actually referencing
    
    // For now, let's create a simple test entry to see what happens
    console.log('Attempting to create user entry for:', { user_id, email });
    
    // Convert Firebase UID to UUID format
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(user_id).digest('hex');
    const uuid = [
      hash.substr(0, 8),
      hash.substr(8, 4),
      '4' + hash.substr(13, 3),
      ((parseInt(hash.substr(16, 1), 16) & 0x3) | 0x8).toString(16) + hash.substr(17, 3),
      hash.substr(20, 12)
    ].join('-');

    // Try to insert a dummy typing result first to create the user relationship
    const dummyResult = {
      user_id: uuid,
      user_email: email,
      wpm: 0,
      raw: 0,
      accuracy: 0,
      time: 0,
      test_mode: 'setup',
      consistency: 0,
    };

    const { data, error } = await supabaseAdmin
      .from('typing_results')
      .insert(dummyResult)
      .select('id');

    if (error) {
      console.error('User seed failed:', error);
      return NextResponse.json({ 
        error: 'Failed to create user entry', 
        details: error.message,
        converted_user_id: uuid
      }, { status: 500 });
    }

    // Delete the dummy entry immediately
    await supabaseAdmin
      .from('typing_results')
      .delete()
      .eq('id', data[0].id);

    return NextResponse.json({ 
      success: true, 
      message: 'User entry validated',
      original_user_id: user_id,
      converted_user_id: uuid
    });

  } catch (e: any) {
    console.error('User seed error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to seed user' }, { status: 500 });
  }
}
