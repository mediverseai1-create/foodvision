/** Central pricing + credit configuration. Credit quantities are intentionally NOT hardcoded:
 *  set STARTER_CREDITS / PROFESSIONAL_CREDITS / ENTERPRISE_CREDITS once decided. */
export type PlanId = 'starter' | 'professional' | 'enterprise';

export const PLANS: { id: PlanId; name: string; price: number; blurb: string; highlights: string[] }[] = [
  { id: 'starter', name: 'Starter', price: 47, blurb: 'For a single site building its first inspection history.', highlights: ['AI visual inspection', 'Products, batches & suppliers', 'Human review workflow', 'Monthly AI credits'] },
  { id: 'professional', name: 'Professional', price: 57, blurb: 'For teams connecting quality signals across lines and suppliers.', highlights: ['Everything in Starter', 'Anomaly detection', 'Incident investigation', 'AI quality reporting', 'Monthly AI credits'] },
  { id: 'enterprise', name: 'Enterprise', price: 97, blurb: 'For multi-site operations with recall and HACCP workflows.', highlights: ['Everything in Professional', 'Recall intelligence', 'HACCP intelligence', 'AI agent orchestration', 'Monthly AI credits'] },
];

export function paymentLink(plan: PlanId): string | null {
  const v = { starter: process.env.STARTER_PAYMENT_LINK, professional: process.env.PROFESSIONAL_PAYMENT_LINK, enterprise: process.env.ENTERPRISE_PAYMENT_LINK }[plan];
  return v && v.startsWith('http') ? v : null;
}

export function planCredits(plan: PlanId): number | null {
  const v = { starter: process.env.STARTER_CREDITS, professional: process.env.PROFESSIONAL_CREDITS, enterprise: process.env.ENTERPRISE_CREDITS }[plan];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Credits charged per AI operation (relative weights; adjust centrally). */
export const CREDIT_COST = {
  image_analysis: 5,
  quality_analysis: 3,
  anomaly_reasoning: 3,
  incident_investigation: 6,
  supplier_analysis: 3,
  recall_intelligence: 6,
  report: 5,
  agent_run: 8,
  ai_question: 1,
} as const;
export type AiOperation = keyof typeof CREDIT_COST;
export const LOW_CREDIT_THRESHOLD = 0.2;
