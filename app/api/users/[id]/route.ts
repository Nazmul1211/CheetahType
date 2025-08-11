import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// DELETE /api/users/:id - delete user row and cascade tests
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}


