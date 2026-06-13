const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export async function request(path, { headers, ...options } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...DEFAULT_HEADERS, ...headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}
