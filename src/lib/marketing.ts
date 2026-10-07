import type { PageContent } from '@/components/PageTemplate';

const LIMITS = 'FoodVision AI is decision support for qualified professionals. A photograph cannot establish pathogens, toxins, chemical contamination, allergens or regulatory compliance; where evidence is insufficient the product says additional testing or qualified human review is required.';

export const PAGES: Record<string, PageContent> = {
  'ai-inspection': {
    eyebrow: 'AI Inspection', title: ['Structured findings,', 'not paragraphs.'], note: LIMITS,
    intro: 'Upload an image, connect it to a product, batch, line and supplier, and receive validated, structured findings your team can review, confirm or reject.',
    sections: [
      { h: 'Upload → Validate → Analyze', p: 'Each image is checked for usability before analysis. Findings carry category, severity, confidence, observed evidence, interpretation, recommended action and stated limitations.' },
      { h: 'Evidence vs. interpretation', p: 'What is visibly observed is always kept separate from what the AI infers. Nothing is treated as a confirmed quality failure until an authorized reviewer confirms it.' },
      { h: 'Packaging & label inspection', p: 'Visible packaging damage, seal appearance, label position and legible text are examined where image quality allows.', points: ['Legal or regulatory label compliance is never claimed from an image', 'Unclear text is reported as unclear, not guessed'] },
      { h: 'Your quality categories', p: 'Classification — acceptable, review required, defect detected, critical review — follows the standards your organization configures, with the reasoning shown.' },
    ],
  },
  'quality-intelligence': {
    eyebrow: 'Quality Intelligence', title: ['What changed,', 'where, and why it', 'may matter.'],
    intro: 'Findings are connected to production lines, products, batches and suppliers so recurring patterns become visible early.',
    sections: [
      { h: 'Real anomaly detection', p: 'Anomalies are computed against an actual historical baseline. With too little history, FoodVision AI says so instead of showing a reassuring all-clear.' },
      { h: 'Qualified language', p: 'Patterns are described as associated with, correlated with, or a possible contributor — never as proven root cause.' },
      { h: 'Batch & lot intelligence', p: 'See which lots may warrant additional review, with the evidence behind each risk signal. No batch is automatically declared unsafe.' },
    ],
  },
  'food-safety': {
    eyebrow: 'Food Safety & HACCP', title: ['Organize the evidence.', 'Keep humans', 'in charge.'], color: 'char', note: LIMITS,
    intro: 'A workspace for inspection findings, incidents, environmental data, HACCP records and corrective actions — with AI that surfaces areas needing attention.',
    sections: [
      { h: 'HACCP intelligence', p: 'Hazards, critical control points, monitoring records, deviations and corrective actions in one place. FoodVision AI does not certify HACCP compliance.' },
      { h: 'Honest limits', p: 'No claim of laboratory-level detection from images. Validated instruments and qualified reviewers remain essential.' },
      { h: 'Food integrity signals', p: 'Unusual supplier or documentation patterns can be flagged for review. The AI never claims to prove fraud.' },
    ],
  },
  'supplier-intelligence': {
    eyebrow: 'Supplier Intelligence', title: ['Supplier signals', 'with the evidence', 'attached.'],
    intro: 'Track findings, incidents and corrective actions by supplier, product and lot, and see repeated patterns as they develop.',
    sections: [
      { h: 'No scores from thin data', p: 'Supplier risk signals appear only when there is enough evidence, and always show the records behind them.' },
      { h: 'Lot-level traceability', p: 'Connect supplier, product, batch and inspection history so related lots can be reviewed together.' },
    ],
  },
  'incident-intelligence': {
    eyebrow: 'Incident Intelligence', title: ['Investigate with', 'context, not', 'guesswork.'], color: 'sage',
    intro: 'Create an incident, attach evidence and let agents organize observed evidence, related patterns, possible contributors and recommended investigation steps.',
    sections: [
      { h: 'Observed → Related → Possible', p: 'Output is separated into what the system knows, what similar history shows, and hypotheses that still require review.' },
      { h: 'Recall scope support', p: 'Identify potentially related batches and products to inform scope analysis. Recall decisions stay with authorized people; FoodVision AI never issues or announces a recall.' },
      { h: 'Action and feedback', p: 'Every investigation can produce owned, prioritized actions; outcomes and reviewer feedback become context for future analysis.' },
    ],
  },
  'how-it-works': {
    eyebrow: 'How it works', title: ['See. Understand.', 'Investigate. Act.'],
    intro: 'Data → Understand → Detect → Investigate → Predict → Recommend → Act → Learn.',
    sections: [
      { h: '1 · Capture', p: 'Images and structured records: products, batches, suppliers, lines, quality and environmental data.' },
      { h: '2 · Analyze', p: 'Vision analysis creates structured findings; deterministic statistics establish baselines and anomalies.' },
      { h: '3 · Reason', p: 'Specialized agents hand intelligence to one another, using only data the current user is authorized to access.' },
      { h: '4 · Review & act', p: 'People confirm findings, own actions and record outcomes. Feedback is stored as context. FoodVision AI does not claim to retrain itself.' },
    ],
  },
  features: {
    eyebrow: 'Features', title: ['Everything the', 'quality team needs.'],
    intro: 'An authenticated operations platform, not a dashboard with an AI add-on.',
    sections: [
      { h: 'Operations', p: 'Inspections, products, batches/lots, facilities and lines, suppliers, data import.' },
      { h: 'Intelligence', p: 'Quality trends, anomaly detection, food safety, HACCP, recall intelligence, reports.' },
      { h: 'Action', p: 'Incidents, corrective actions, activity history, AI agents and assistant.' },
      { h: 'Enterprise controls', p: 'Supabase Auth, per-organization Row Level Security, role-based permissions, server-side AI and server-side credit accounting.' },
    ],
  },
  about: {
    eyebrow: 'About', title: ['An intelligence', 'layer for food', 'quality.'],
    intro: 'FoodVision AI exists to help food-quality teams see what changed, understand what it may mean and decide what happens next.',
    sections: [{ h: 'Our position', p: 'AI should support qualified professionals, state its limits clearly and keep people accountable for food-safety decisions.' }],
  },
  security: {
    eyebrow: 'Security', title: ['Isolation by', 'design.'], color: 'char',
    intro: 'Security controls are implemented in the platform itself.',
    sections: [
      { h: 'Tenant isolation', p: 'Every record belongs to an organization and is protected by PostgreSQL Row Level Security, not just UI filtering.' },
      { h: 'Server-side secrets', p: 'AI keys and the service role never reach the browser. Credit balances can only be changed on the server.' },
      { h: 'Role-based access', p: 'Permissions are enforced in the database. Images are stored in a private bucket scoped by organization.' },
      { h: 'Certifications', p: 'FoodVision AI does not currently claim third-party security certifications.' },
    ],
  },
  privacy: {
    eyebrow: 'Privacy', title: ['Privacy', 'policy.'], color: 'char',
    intro: 'Draft summary — to be reviewed by your legal counsel before launch.',
    sections: [
      { h: 'Data we process', p: 'Account details, organization data you enter or upload, and usage records needed to operate credits.' },
      { h: 'AI processing', p: 'Images and context you submit are sent to the configured AI provider to generate results. Do not upload data you are not permitted to process.' },
      { h: 'Your control', p: 'Contact us to request access or deletion of your organization data.' },
    ],
  },
  terms: {
    eyebrow: 'Terms', title: ['Terms of', 'service.'], color: 'char',
    intro: 'Draft summary — to be reviewed by your legal counsel before launch.',
    sections: [
      { h: 'Decision support only', p: LIMITS },
      { h: 'Human responsibility', p: 'Customers remain responsible for food-safety, recall and regulatory decisions.' },
      { h: 'Billing', p: 'Plans are billed through the payment provider linked on the pricing page.' },
    ],
  },
};
