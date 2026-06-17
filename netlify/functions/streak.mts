import { createClient } from '@supabase/supabase-js';

function isNextDay(prevDateKey: string, dateKey: string): boolean {
  const prev = new Date(`${prevDateKey}T00:00:00Z`);
  const curr = new Date(`${dateKey}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
  return diffDays === 1;
}

async function getDiscordUserId(accessToken: string): Promise<string | null> {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user.id ?? null;
}

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured');
  return createClient(url, key);
}

export default async (req: Request) => {
  const auth = req.headers.get('authorization');
  const accessToken = auth?.replace(/^Bearer\s+/i, '');
  if (!accessToken) {
    return Response.json({ error: 'Missing Discord access token' }, { status: 401 });
  }

  const discordUserId = await getDiscordUserId(accessToken);
  if (!discordUserId) {
    return Response.json({ error: 'Invalid Discord access token' }, { status: 401 });
  }

  const db = supabase();

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('streaks')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .maybeSingle();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(
      data ?? {
        discord_user_id: discordUserId,
        current_streak: 0,
        max_streak: 0,
        total_played: 0,
        total_won: 0,
        last_completed_date: null,
      },
    );
  }

  if (req.method === 'POST') {
    const { dateKey, won } = await req.json();
    if (!dateKey || typeof won !== 'boolean') {
      return Response.json({ error: 'Missing dateKey or won' }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await db
      .from('streaks')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .maybeSingle();
    if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 });

    if (existing?.last_completed_date === dateKey) {
      return Response.json(existing);
    }

    const continuesStreak =
      won && !!existing?.last_completed_date && isNextDay(existing.last_completed_date, dateKey);
    const currentStreak = won ? (continuesStreak ? (existing?.current_streak ?? 0) + 1 : 1) : 0;
    const maxStreak = Math.max(existing?.max_streak ?? 0, currentStreak);

    const updated = {
      discord_user_id: discordUserId,
      current_streak: currentStreak,
      max_streak: maxStreak,
      total_played: (existing?.total_played ?? 0) + 1,
      total_won: (existing?.total_won ?? 0) + (won ? 1 : 0),
      last_completed_date: dateKey,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await db.from('streaks').upsert(updated);
    if (upsertError) return Response.json({ error: upsertError.message }, { status: 500 });

    return Response.json(updated);
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/streak',
};
