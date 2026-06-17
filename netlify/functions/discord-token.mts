export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return Response.json({ error: 'Discord credentials not configured' }, { status: 500 });
  }

  const { code } = await req.json();
  if (!code) {
    return Response.json({ error: 'Missing code' }, { status: 400 });
  }

  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    return Response.json({ error: 'Discord token exchange failed', detail: text }, { status: 502 });
  }

  const { access_token } = await tokenResponse.json();
  return Response.json({ access_token });
};

export const config = {
  path: '/api/discord-token',
};
