export const API_BASE = ''; // Using Vite proxy configuration

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) throw new Error(await res.text());
  return res;
}

export async function uploadLoansCsv(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await req('/api/ingest/loans', { method: 'POST', body: fd });
  return res.json() as Promise<{inserted:number; updated:number; skipped:number}>;
}

export async function uploadDocument(file: File, loan_id?: string, doc_type?: string) {
  const fd = new FormData();
  fd.append('file', file);
  if (loan_id) fd.append('loan_id', loan_id);
  if (doc_type) fd.append('doc_type', doc_type);
  const res = await req('/api/ingest/document', { method: 'POST', body: fd });
  return res.json();
}

export async function loansSummary() {
  const res = await req('/api/loans/summary');
  return res.json();
}

export async function listDocuments(params: Record<string,string|number|boolean> = {}) {
  const url = new URL(`${API_BASE}/api/documents`);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url);
  return res.json();
}

export async function extractDocument(doc_id: string) {
  const res = await req(`/api/documents/${doc_id}/extract`, { method: 'POST' });
  return res.json();
}

export async function indexDocument(doc_id: string) {
  const res = await req(`/api/rag/index/${doc_id}`, { method: 'POST' });
  return res.json();
}

export async function getDocument(doc_id: string) {
  const res = await req(`/api/documents/${doc_id}`);
  return res.json();
}

export async function ragQuery(q: string) {
  const res = await req('/api/rag/query', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ q }) 
  });
  return res.json();
}

export async function complianceMissing410A(page = 1) {
  const res = await req(`/api/compliance/findings/missing-410a?page=${page}`);
  return res.json();
}

export async function searchLoans(q = '', page = 1) {
  const url = new URL(`${API_BASE}/api/loans/search`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', '20');
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url);
  return res.json();
}

export async function draft410A(loan_id: string) {
  const res = await req('/api/410a/draft', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ loan_id }) 
  });
  return res.json();
}