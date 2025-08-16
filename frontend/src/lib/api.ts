/// <reference types="vite/client" />

/**
 * Centralized API base for production and dev.
 * Read from Vite env at build time.
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/,'');

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is empty – set it in Netlify (or .env) and rebuild.');
}

/** Core helper that preserves options and throws on non-2xx */
async function core(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}: ${text || res.statusText}`);
  }
  return res;
}

export async function getJSON<T=any>(path: string, init: RequestInit = {}) {
  const res = await core(path, { ...init, method: 'GET' });
  const text = await res.text();
  return text ? JSON.parse(text) as T : undefined as T;
}

export async function postJSON<T=any>(path: string, body: unknown, init: RequestInit = {}) {
  const res = await core(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  return text ? JSON.parse(text) as T : undefined as T;
}

/** ===== Named endpoint helpers (kept to satisfy existing imports) ===== */

/** Used by CommandBar and others */
export function ragQuery(payload: { q: string }) {
  return postJSON('/api/rag/query', payload);
}

/** Used by CommandBar */
export function draft410A(loan_id: string) {
  return postJSON('/api/410a/draft', { loan_id });
}

/** Document extraction and indexing */
export function extractDocument(doc_id: string) {
  return postJSON(`/api/documents/${doc_id}/extract`, {});
}
export function indexDocument(doc_id: string) {
  return postJSON(`/api/rag/index/${doc_id}`, {});
}

/** Documents listing/detail */
export function listDocuments(params: Record<string,string|number|boolean> = {}) {
  const url = new URL(`${API_BASE}/api/documents`);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  return fetch(url.toString()).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}
export function getDocument(doc_id: string) {
  return getJSON(`/api/documents/${doc_id}`);
}

/** Loans */
export function searchLoans(q = '', page = 1) {
  const url = new URL(`${API_BASE}/api/loans/search`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', '20');
  if (q) url.searchParams.set('q', q);
  return fetch(url.toString()).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}
export function loansSummary() {
  return getJSON('/api/loans/summary');
}

/** Ingestion */
export function uploadLoansCsv(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return core('/api/ingest/loans', { method: 'POST', body: fd }).then(r => r.json());
}
export function uploadDocument(file: File, loan_id?: string, doc_type?: string) {
  const fd = new FormData();
  fd.append('file', file);
  if (loan_id) fd.append('loan_id', loan_id);
  if (doc_type) fd.append('doc_type', doc_type);
  return core('/api/ingest/document', { method: 'POST', body: fd }).then(r => r.json());
}

/** Health */
export function apiHealth() {
  return getJSON('/api/health');
}
