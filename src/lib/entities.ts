export type Field = { name: string; label: string; type: 'text' | 'textarea' | 'date' | 'select' | 'ref'; required?: boolean; options?: string[]; ref?: 'suppliers' | 'products' | 'batches' | 'facilities' | 'production_lines' | 'incidents' };
export type Entity = {
  key: string; table: string; title: string; singular: string; intro: string; empty: { h: string; p: string };
  fields: Field[]; columns: string[]; select: string; statusField?: { name: string; options: string[] };
};

export const REF_LABEL: Record<string, string> = { suppliers: 'name', products: 'name', batches: 'lot_code', facilities: 'name', production_lines: 'name', incidents: 'title' };

export const ENTITIES: Record<string, Entity> = {
  products: {
    key: 'products', table: 'products', title: 'Products', singular: 'product', select: '*, suppliers(name)',
    intro: 'Products you inspect and track, with their supplier and quality history.',
    empty: { h: 'No products yet', p: 'Add your products so inspections and batches can be tied to them.' },
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'sku', label: 'SKU / code', type: 'text' }, { name: 'category', label: 'Category', type: 'text' }, { name: 'supplier_id', label: 'Supplier', type: 'ref', ref: 'suppliers' }],
    columns: ['name', 'sku', 'category', 'suppliers.name'],
  },
  batches: {
    key: 'batches', table: 'batches', title: 'Batches / Lots', singular: 'batch', select: '*, products(name), suppliers(name), production_lines(name), facilities(name)',
    intro: 'Batch and lot records connecting products, suppliers, lines and inspection results.',
    empty: { h: 'No batches yet', p: 'Add batches or lots to trace findings back to production and suppliers.' },
    fields: [{ name: 'lot_code', label: 'Batch / lot code', type: 'text', required: true }, { name: 'product_id', label: 'Product', type: 'ref', ref: 'products' }, { name: 'supplier_id', label: 'Supplier', type: 'ref', ref: 'suppliers' }, { name: 'facility_id', label: 'Facility', type: 'ref', ref: 'facilities' }, { name: 'line_id', label: 'Production line', type: 'ref', ref: 'production_lines' }, { name: 'produced_on', label: 'Production date', type: 'date' }],
    columns: ['lot_code', 'products.name', 'suppliers.name', 'production_lines.name', 'produced_on', 'quality_status'],
  },
  suppliers: {
    key: 'suppliers', table: 'suppliers', title: 'Suppliers', singular: 'supplier', select: '*',
    intro: 'Supplier records. Risk signals appear in Quality Intelligence only when there is enough evidence.',
    empty: { h: 'No suppliers yet', p: 'Add suppliers to connect batches and findings to their source.' },
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'contact', label: 'Contact', type: 'text' }, { name: 'notes', label: 'Notes', type: 'textarea' }],
    columns: ['name', 'contact', 'notes'],
  },
  facilities: {
    key: 'facilities', table: 'facilities', title: 'Facilities', singular: 'facility', select: '*',
    intro: 'Sites where production and inspection happen.',
    empty: { h: 'No facilities yet', p: 'Add a facility, then its production lines.' },
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'location', label: 'Location', type: 'text' }],
    columns: ['name', 'location'],
  },
  lines: {
    key: 'lines', table: 'production_lines', title: 'Production Lines', singular: 'production line', select: '*, facilities(name)',
    intro: 'Production lines allow defect patterns to be connected to operational locations.',
    empty: { h: 'No production lines yet', p: 'Add lines to see where quality patterns concentrate.' },
    fields: [{ name: 'name', label: 'Line name', type: 'text', required: true }, { name: 'facility_id', label: 'Facility', type: 'ref', ref: 'facilities' }],
    columns: ['name', 'facilities.name'],
  },
  incidents: {
    key: 'incidents', table: 'incidents', title: 'Incidents', singular: 'incident', select: '*, batches(lot_code), suppliers(name), products(name)',
    intro: 'Investigate quality incidents by connecting evidence, batches, suppliers and actions.',
    empty: { h: 'No incidents', p: 'Create an incident to organize evidence and run an AI-assisted investigation.' },
    fields: [{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'] }, { name: 'product_id', label: 'Product', type: 'ref', ref: 'products' }, { name: 'batch_id', label: 'Batch / lot', type: 'ref', ref: 'batches' }, { name: 'supplier_id', label: 'Supplier', type: 'ref', ref: 'suppliers' }, { name: 'facility_id', label: 'Facility', type: 'ref', ref: 'facilities' }],
    columns: ['title', 'severity', 'status', 'batches.lot_code', 'suppliers.name', 'created_at'],
    statusField: { name: 'status', options: ['open', 'investigating', 'resolved', 'closed'] },
  },
  actions: {
    key: 'actions', table: 'corrective_actions', title: 'Actions', singular: 'action', select: '*, incidents(title), batches(lot_code)',
    intro: 'The action queue: intelligence turned into owned, prioritized work.',
    empty: { h: 'No actions', p: 'Actions appear here when you create them or accept AI recommendations.' },
    fields: [{ name: 'title', label: 'Action', type: 'text', required: true }, { name: 'definition_of_done', label: 'Definition of done', type: 'textarea' }, { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] }, { name: 'due_date', label: 'Deadline', type: 'date' }, { name: 'incident_id', label: 'Related incident', type: 'ref', ref: 'incidents' }, { name: 'batch_id', label: 'Related batch', type: 'ref', ref: 'batches' }, { name: 'notes', label: 'Notes', type: 'textarea' }],
    columns: ['title', 'priority', 'status', 'due_date', 'incidents.title'],
    statusField: { name: 'status', options: ['open', 'in_progress', 'done', 'cancelled'] },
  },
  haccp: {
    key: 'haccp', table: 'haccp_records', title: 'HACCP', singular: 'HACCP record', select: '*',
    intro: 'Organize hazards, critical control points, monitoring, deviations and corrective actions. FoodVision AI does not certify HACCP compliance.',
    empty: { h: 'No HACCP records', p: 'Add records to let the Food Safety Intelligence Agent summarize patterns and deviations.' },
    fields: [{ name: 'hazard', label: 'Hazard', type: 'text', required: true }, { name: 'ccp', label: 'Critical control point', type: 'text' }, { name: 'monitoring', label: 'Monitoring', type: 'textarea' }, { name: 'deviation', label: 'Deviation', type: 'textarea' }, { name: 'corrective_action', label: 'Corrective action', type: 'textarea' }, { name: 'recorded_on', label: 'Date', type: 'date' }],
    columns: ['hazard', 'ccp', 'deviation', 'recorded_on'],
  },
  recall: {
    key: 'recall', table: 'recall_cases', title: 'Recall Intelligence', singular: 'recall case', select: '*',
    intro: 'Scope analysis support. FoodVision AI never issues or announces a recall; that decision stays with authorized personnel.',
    empty: { h: 'No recall cases', p: 'Open a case to organize potentially affected batches and evidence for human review.' },
    fields: [{ name: 'title', label: 'Case title', type: 'text', required: true }, { name: 'scope_summary', label: 'Scope notes', type: 'textarea' }],
    columns: ['title', 'status', 'scope_summary', 'created_at'],
    statusField: { name: 'status', options: ['scoping', 'under_review', 'decision_pending', 'closed'] },
  },
  standards: {
    key: 'standards', table: 'quality_standards', title: 'Quality Standards', singular: 'quality standard', select: '*',
    intro: 'Your organization’s own classification criteria. FoodVision AI applies these; it does not invent universal standards.',
    empty: { h: 'No standards configured', p: 'Without configured standards the AI uses generic categories and says so.' },
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'description', label: 'Criteria', type: 'textarea', required: true }],
    columns: ['name', 'description'],
  },
};

export function getPath(row: Record<string, unknown>, path: string): string {
  const v = path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), row);
  if (v == null || v === '') return '—';
  return String(v).replace(/T\d{2}:.*$/, '');
}
