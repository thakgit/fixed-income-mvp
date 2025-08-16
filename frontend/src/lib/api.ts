// central API helpers
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/,'');

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is empty – set it in Netlify & rebuild');
}

export async function json<T=any>(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init.headers||{}) },
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) as T : (undefined as T);
}
