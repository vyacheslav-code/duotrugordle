export interface StreakRecord {
  discord_user_id: string;
  current_streak: number;
  max_streak: number;
  total_played: number;
  total_won: number;
  last_completed_date: string | null;
}

export async function fetchStreak(accessToken: string): Promise<StreakRecord> {
  const res = await fetch('/api/streak', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch streak');
  return res.json();
}

export async function recordResult(
  accessToken: string,
  dateKey: string,
  won: boolean,
): Promise<StreakRecord> {
  const res = await fetch('/api/streak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ dateKey, won }),
  });
  if (!res.ok) throw new Error('Failed to record result');
  return res.json();
}
