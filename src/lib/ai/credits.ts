import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import { CREDIT_COST, type AiOperation } from '@/lib/pricing';
import { AiError, MODEL } from './gemini';

export async function getBalance(sb: SupabaseClient, orgId: string) {
  const { data } = await sb.from('credit_balances').select('*').eq('org_id', orgId).maybeSingle();
  return data as { plan: string; allocated: number; used: number; period_start: string; period_end: string | null } | null;
}

/** Check → run → deduct, all server-side. The client can never alter balances (RLS: read-only; RPC: service role only). */
export async function withCredits<T>(sb: SupabaseClient, ctx: { orgId: string; userId: string }, op: AiOperation, fn: () => Promise<{ result: T; usage?: { input: number; output: number } }>): Promise<T> {
  const cost = CREDIT_COST[op];
  const bal = await getBalance(sb, ctx.orgId);
  if (!bal || bal.allocated - bal.used < cost) throw new AiError('no_credits', `This action needs ${cost} credits. Remaining: ${bal ? bal.allocated - bal.used : 0}. Upgrade your plan or add credits.`);
  const { result, usage } = await fn();
  const { data: ok, error } = await createAdminClient().rpc('consume_credits', { _org: ctx.orgId, _user: ctx.userId, _op: op, _credits: cost, _model: MODEL, _in: usage?.input ?? 0, _out: usage?.output ?? 0 });
  if (error || !ok) throw new AiError('no_credits', 'Credits were exhausted while this operation ran.');
  return result;
}
