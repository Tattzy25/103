import sql from '../database/neon';

interface ChannelSession {
  channelCode: string;
  userId: string;
  sessionId: string;
  permissions: string[];
  expiresAt: Date;
}

export async function storeChannelSession(session: ChannelSession): Promise<void> {
  await sql`
    INSERT INTO channel_sessions (channel_code, user_id, session_id, permissions, expires_at)
    VALUES (${session.channelCode}, ${session.userId}, ${session.sessionId}, ${JSON.stringify(session.permissions)}, ${session.expiresAt.toISOString()})
    ON CONFLICT (channel_code) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    session_id = EXCLUDED.session_id,
    permissions = EXCLUDED.permissions,
    expires_at = EXCLUDED.expires_at;
  `;
}

export async function getChannelSession(channelCode: string): Promise<ChannelSession | null> {
  const res = await sql`
    SELECT channel_code, user_id, session_id, permissions, expires_at
    FROM channel_sessions
    WHERE channel_code = ${channelCode} AND expires_at > NOW();
  `;

  if (res.length > 0) {
    const row = res[0];
    return {
      channelCode: row.channel_code,
      userId: row.user_id,
      sessionId: row.session_id,
      permissions: row.permissions,
      expiresAt: new Date(row.expires_at),
    };
  }
  return null;
}