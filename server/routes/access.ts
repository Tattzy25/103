import express, { Request, Response } from "express";
import crypto from "crypto";
import Ably from "ably";
import { neon } from "@neondatabase/serverless";

const router = express.Router();

// Neon client for serverless Postgres
const client = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null; // Conditionally initialize Neon client

const CODE_TTL_MS = 2 * 60 * 60 * 1000; // codes valid for 2 hours

// Ably API key from environment
const ABLY_API_KEY = process.env.ABLY_API_KEY;
if (!ABLY_API_KEY) {
  console.warn("⚠️  ABLY_API_KEY not set - Ably features will be disabled");
}

const ablyREST = ABLY_API_KEY ? new Ably.Rest(ABLY_API_KEY) : null;

function generateUniqueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    code += chars[idx];
  }
  return code;
}

async function createTokenRequest(channelName: string) {
  if (!ablyREST) {
    throw new Error("Ably not configured - ABLY_API_KEY missing");
  }
  return ablyREST.auth.createTokenRequest({
    capability: JSON.stringify({ [channelName]: ["subscribe", "publish"] }),
    ttl: 2 * 60 * 60 * 1000 // Token valid 2 hours
  });
}

async function createGuestTokenRequest(channelName: string) {
  if (!ablyREST) {
    throw new Error("Ably not configured - ABLY_API_KEY missing");
  }
  return ablyREST.auth.createTokenRequest({
    capability: JSON.stringify({ [channelName]: ["subscribe"] }),
    ttl: 2 * 60 * 60 * 1000 // Token valid 2 hours
  });
}

async function insertCodeMapping(code: string, channelName: string, expiresAt: number) {
  if (!client) throw new Error("Database client not initialized.");
  await client`INSERT INTO access_codes (code, channel_name, expires_at) VALUES (${code}, ${channelName}, ${new Date(expiresAt)})`;
}

async function getCodeMapping(code: string) {
  if (!client) throw new Error("Database client not initialized.");
  const result = await client`SELECT channel_name, expires_at FROM access_codes WHERE code = ${code}`;
  if (result.length === 0) return null;
  return {
    channelName: result[0].channel_name,
    expiresAt: new Date(result[0].expires_at).getTime()
  };
}

async function deleteExpiredCodes() {
  if (!client) throw new Error("Database client not initialized.");
  await client`DELETE FROM access_codes WHERE expires_at < NOW()`;
}

// Host endpoint - generates code and host Ably token
router.post('/host', async (_req: Request, res: Response) => {
  try {
    let code = '';
    let exists = true;

    // Ensure code uniqueness
    while (exists) {
      code = generateUniqueCode();
      if (!(await getCodeMapping(code))) {
        exists = false;
      }
    }

    const channelName = `channel-${crypto.randomUUID()}`;
    const tokenRequest = await createTokenRequest(channelName);
    const expiresAt = Date.now() + CODE_TTL_MS;

    await insertCodeMapping(code, channelName, expiresAt);

    res.json({
      code,
      channelName,
      tokenRequest
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate host token' });
  }
});

// Guest endpoint - validate code and issue subscribe-only token
router.post('/guest', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    const entry = await getCodeMapping(code);
    if (!entry || entry.expiresAt < Date.now()) {
      return res.status(404).json({ error: 'Code not found or expired' });
    }
    const tokenRequest = await createGuestTokenRequest(entry.channelName);
    res.json({ tokenRequest, channelName: entry.channelName });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate guest token' });
  }
});

// Periodic cleanup - only run if database is available
if (client) {
  setInterval(() => {
    deleteExpiredCodes().catch(console.error);
  }, 5 * 60 * 1000);
} else {
  console.warn("⚠️  Database not configured - periodic cleanup disabled");
}

export default router;