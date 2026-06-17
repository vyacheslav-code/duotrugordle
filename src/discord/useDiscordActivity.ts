import { useEffect, useRef, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

export interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
}

interface DiscordActivityState {
  isDiscord: boolean;
  ready: boolean;
  user: DiscordUser | null;
  accessToken: string | null;
}

function isRunningInDiscord(): boolean {
  return new URLSearchParams(window.location.search).has('frame_id');
}

export function useDiscordActivity(): DiscordActivityState {
  const inDiscord = isRunningInDiscord();
  const [state, setState] = useState<DiscordActivityState>({
    isDiscord: inDiscord,
    ready: !inDiscord,
    user: null,
    accessToken: null,
  });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !state.isDiscord) {
      return;
    }
    initialized.current = true;

    (async () => {
      try {
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
        if (!clientId) {
          throw new Error('VITE_DISCORD_CLIENT_ID is not set');
        }

        const discordSdk = new DiscordSDK(clientId);
        await discordSdk.ready();

        const { code } = await discordSdk.commands.authorize({
          client_id: clientId,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        const tokenRes = await fetch('/api/discord-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const { access_token } = await tokenRes.json();

        const auth = await discordSdk.commands.authenticate({ access_token });
        if (!auth?.user) throw new Error('Discord authentication failed');

        setState({
          isDiscord: true,
          ready: true,
          accessToken: access_token,
          user: {
            id: auth.user.id,
            username: auth.user.username,
            globalName: auth.user.global_name ?? null,
          },
        });
      } catch (err) {
        console.error('Discord activity init failed', err);
        setState((s) => ({ ...s, ready: true }));
      }
    })();
  }, [state.isDiscord]);

  return state;
}
