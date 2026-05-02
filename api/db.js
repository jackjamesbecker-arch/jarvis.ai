const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation'
};

async function sbFetch(path, method = 'GET', body = null, extra = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { ...headers, ...extra },
    body: body ? JSON.stringify(body) : null
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { action, payload } = req.body || {};

  try {
    switch (action) {
      case 'load_operator': {
        const r = await sbFetch(`operators?email=eq.${encodeURIComponent(payload.email)}&limit=1`);
        return res.status(200).json({ data: r.data[0] || null });
      }
      case 'save_operator': {
        const r = await sbFetch('operators', 'POST', payload, { 'Prefer': 'resolution=merge-duplicates,return=representation' });
        return res.status(200).json({ ok: r.ok, data: r.data });
      }
      case 'load_chat': {
        const r = await sbFetch(`chat_history?email=eq.${encodeURIComponent(payload.email)}&limit=1`);
        return res.status(200).json({ data: r.data[0] || null });
      }
      case 'save_chat': {
        const r = await sbFetch('chat_history', 'POST', payload, { 'Prefer': 'resolution=merge-duplicates,return=representation' });
        return res.status(200).json({ ok: r.ok });
      }
      case 'load_contacts': {
        const r = await sbFetch(`contacts?email=eq.${encodeURIComponent(payload.email)}&order=created_at`);
        return res.status(200).json({ data: r.data || [] });
      }
      case 'save_contact': {
        const r = await sbFetch('contacts', 'POST', payload);
        return res.status(200).json({ ok: r.ok, data: r.data });
      }
      case 'delete_contact': {
        const r = await sbFetch(`contacts?id=eq.${payload.id}`, 'DELETE');
        return res.status(200).json({ ok: r.ok });
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
