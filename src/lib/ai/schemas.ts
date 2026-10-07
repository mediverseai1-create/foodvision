import { z } from 'zod';

export const Severity = z.enum(['low', 'medium', 'high', 'critical']);

export const FindingSchema = z.object({
  finding: z.string().min(3).max(300),
  category: z.enum(['product_defect', 'packaging', 'label', 'process', 'hygiene_ppe', 'foreign_material', 'other']),
  severity: Severity,
  confidence: z.number().min(0).max(1),
  observed_evidence: z.string().min(3).max(800),
  interpretation: z.string().max(800),
  recommended_action: z.string().max(500),
  limitations: z.string().max(500),
});

export const VisionResultSchema = z.object({
  image_usable: z.boolean(),
  image_quality_note: z.string().max(400),
  classification: z.enum(['acceptable', 'review_required', 'defect_detected', 'critical_review', 'insufficient_evidence']),
  classification_rationale: z.string().max(800),
  summary: z.string().max(800),
  visible_label_text: z.string().max(600).nullable(),
  findings: z.array(FindingSchema).max(12),
  human_review_required: z.boolean(),
  limitations: z.string().max(600),
});
export type VisionResult = z.infer<typeof VisionResultSchema>;

export const visionJsonSchema = {
  type: 'object',
  properties: {
    image_usable: { type: 'boolean' },
    image_quality_note: { type: 'string' },
    classification: { type: 'string', enum: ['acceptable', 'review_required', 'defect_detected', 'critical_review', 'insufficient_evidence'] },
    classification_rationale: { type: 'string' },
    summary: { type: 'string' },
    visible_label_text: { type: 'string', nullable: true },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          finding: { type: 'string' },
          category: { type: 'string', enum: ['product_defect', 'packaging', 'label', 'process', 'hygiene_ppe', 'foreign_material', 'other'] },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          confidence: { type: 'number' },
          observed_evidence: { type: 'string' },
          interpretation: { type: 'string' },
          recommended_action: { type: 'string' },
          limitations: { type: 'string' },
        },
        required: ['finding', 'category', 'severity', 'confidence', 'observed_evidence', 'interpretation', 'recommended_action', 'limitations'],
      },
    },
    human_review_required: { type: 'boolean' },
    limitations: { type: 'string' },
  },
  required: ['image_usable', 'image_quality_note', 'classification', 'classification_rationale', 'summary', 'visible_label_text', 'findings', 'human_review_required', 'limitations'],
};

/** Generic agent output: evidence / interpretation / actions are kept separate. */
export const AgentOutputSchema = z.object({
  headline: z.string().max(300),
  observed_evidence: z.array(z.string().max(500)).max(12),
  related_patterns: z.array(z.string().max(500)).max(10),
  possible_contributors: z.array(z.string().max(500)).max(10),
  recommended_actions: z
    .array(z.object({ title: z.string().max(200), priority: z.enum(['low', 'medium', 'high', 'critical']), definition_of_done: z.string().max(400) }))
    .max(8),
  confidence: z.number().min(0).max(1),
  data_sufficient: z.boolean(),
  limitations: z.string().max(600),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;

export const agentJsonSchema = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    observed_evidence: { type: 'array', items: { type: 'string' } },
    related_patterns: { type: 'array', items: { type: 'string' } },
    possible_contributors: { type: 'array', items: { type: 'string' } },
    recommended_actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          definition_of_done: { type: 'string' },
        },
        required: ['title', 'priority', 'definition_of_done'],
      },
    },
    confidence: { type: 'number' },
    data_sufficient: { type: 'boolean' },
    limitations: { type: 'string' },
  },
  required: ['headline', 'observed_evidence', 'related_patterns', 'possible_contributors', 'recommended_actions', 'confidence', 'data_sufficient', 'limitations'],
};
