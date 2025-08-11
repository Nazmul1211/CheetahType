import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// POST /api/users - create or update a user (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firebase_uid,
      email,
      display_name,
      photo_url,
      email_verified,
    } = body || {};

    if (!firebase_uid || !email) {
      return NextResponse.json({ error: 'Missing required fields: firebase_uid and email' }, { status: 400 });
    }

    console.log('Creating/updating user:', { firebase_uid, email, display_name });

    // Upsert user - insert if not exists, update if exists
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        firebase_uid,
        email,
        display_name,
        photo_url,
        email_verified: email_verified || false,
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      }, {
        onConflict: 'firebase_uid'
      })
      .select('id, firebase_uid, email, display_name')
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('User upserted successfully:', data);
    return NextResponse.json({ success: true, user: data });
    
  } catch (e: any) {
    console.error('Error in user upsert:', e);
    return NextResponse.json({ error: e?.message || 'Failed to create/update user' }, { status: 500 });
  }
}

// GET /api/users/[firebase_uid] - get user by Firebase UID
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
    
  } catch (e: any) {
    console.error('Error fetching user:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users - update existing user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { firebase_uid, email, display_name, photo_url } = body;

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid' }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };

    if (email !== undefined) updates.email = email;
    if (display_name !== undefined) updates.display_name = display_name;
    if (photo_url !== undefined) updates.photo_url = photo_url;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('firebase_uid', firebase_uid)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user });

  } catch (e: any) {
    console.error('Error updating user:', e);
    return NextResponse.json({ error: e?.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users - delete user and all associated data
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    // Delete user (cascades to typing_tests and user_sessions due to foreign key constraints)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('firebase_uid', firebase_uid);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User and all associated data deleted' });

  } catch (e: any) {
    console.error('Error deleting user:', e);
    return NextResponse.json({ error: e?.message || 'Failed to delete user' }, { status: 500 });
  }
}
