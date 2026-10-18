import { createHash } from 'node:crypto';
import connectToDatabase from '@/lib/mongodb';
import RequestBudget from '@/models/RequestBudget';
import { RequestError } from '@/lib/requestSecurity';

const local = new Map<string, { count: number; expiresAt: number }>();

// Shared MongoDB budgets survive process restarts and work across server instances.
// Do not use caller-supplied forwarding headers as trusted client identities.
export async function enforceRateLimit(scope: string, subject: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const expiresAt = (bucket + 1) * windowMs;
  const id = createHash('sha256').update(`${scope}:${subject}:${bucket}`).digest('hex');
  const limited = () => new RequestError('Too many attempts. Please try again later.', 429, Math.max(1, Math.ceil((expiresAt - now) / 1000)));
  const connection = await connectToDatabase();
  if (!connection) {
    if (process.env.NODE_ENV === 'production' || process.env.MONGODB_URI) throw new RequestError('Abuse protection is temporarily unavailable.', 503);
    // Bounded, development-only fallback. Production never silently drops limits.
    for (const [key, value] of Array.from(local.entries())) if (value.expiresAt <= now) local.delete(key);
    const value = local.get(id);
    if (value && value.count >= limit) throw limited();
    if (!value && local.size >= 1000) throw limited();
    local.set(id, { count: (value?.count || 0) + 1, expiresAt });
    return;
  }
  await RequestBudget.init();
  try {
    const result = await RequestBudget.findOneAndUpdate({ _id: id, count: { $lt: limit } },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(expiresAt) } }, { upsert: true, new: true });
    if (!result) throw limited();
  } catch (error: any) {
    // A saturated budget cannot match, and its unique _id prevents another insert.
    if (error?.code === 11000) throw limited();
    throw error;
  }
}

export async function limitLogin(scope: string, email: string) {
  await enforceRateLimit(`${scope}-global`, 'all', 100, 60_000);
  await enforceRateLimit(`${scope}-account`, email.trim().toLowerCase(), 10, 15 * 60_000);
}
