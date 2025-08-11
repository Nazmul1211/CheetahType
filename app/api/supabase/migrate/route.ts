import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

function pick<T = any>(obj: Record<string, any>, keys: string[], fallback?: any): T | undefined {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return fallback;
}

export async function POST() {
  try {
    // Load all legacy rows
    const { data: rows, error } = await supabaseAdmin
      .from('typing_results')
      .select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ migrated: 0, message: 'No legacy rows found' });
    }

    let migrated = 0;
    const batch: any[] = [];

    for (const r of rows as Record<string, any>[]) {
      const user_id = pick<string>(r, ['user_id', 'uid', 'user', 'userId']);
      const wpm = pick<number>(r, ['wpm'], 0) || 0;
      const raw_wpm = pick<number>(r, ['raw_wpm', 'rawwpm', 'raw_cpm', 'rawcpm', 'cpm']);
      const accuracy = pick<number>(r, ['accuracy', 'acc']);
      const consistency = pick<number>(r, ['consistency', 'consist', 'stability']);
      const characters = pick<number>(r, ['characters', 'character', 'chars', 'char_count', 'characters_count', 'character_count', 'character_column', 'total_characters', 'total_chars']);
      const errors = pick<number>(r, ['errors', 'error', 'mistakes', 'incorrect_chars', 'incorrect']);
      const duration = pick<number>(r, ['duration', 'time', 'seconds', 'time_seconds']);
      const test_type = pick<string>(r, ['test_type', 'type']);
      const test_mode = pick<string>(r, ['test_mode', 'mode']);
      const time_seconds = pick<number>(r, ['time_seconds', 'seconds', 'duration']);
      const text_content = pick<string>(r, ['text_content', 'text', 'content']);
      const created_at = pick<string>(r, ['created_at']);

      if (!user_id) continue;

      batch.push({
        user_id,
        wpm,
        raw_wpm: raw_wpm ?? null,
        accuracy: accuracy ?? null,
        consistency: consistency ?? null,
        characters: characters ?? null,
        errors: errors ?? null,
        duration: duration ?? null,
        test_type: test_type ?? null,
        test_mode: test_mode ?? null,
        time_seconds: time_seconds ?? null,
        text_content: text_content ?? null,
        created_at: created_at ?? null,
      });

      if (batch.length >= 500) {
        const { error: insErr } = await supabaseAdmin.from('tests').insert(batch);
        if (insErr) return NextResponse.json({ error: insErr.message, migrated }, { status: 500 });
        migrated += batch.length;
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      const { error: insErr } = await supabaseAdmin.from('tests').insert(batch);
      if (insErr) return NextResponse.json({ error: insErr.message, migrated }, { status: 500 });
      migrated += batch.length;
    }

    return NextResponse.json({ migrated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Migration failed' }, { status: 500 });
  }
}


