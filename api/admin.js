const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PHONE = process.env.ADMIN_PHONE;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const otpStore = {};

const sbHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

async function sbFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders });
  return res.json();
}

async function sendSMS(to, body) {
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body }).toString()
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }
  const { action, payload } = body || {};

  try {
    if (action === 'verify_password') {
      if (payload.password !== ADMIN_PASSWORD)
        return res.status(401).json({ error: 'INVALID PASSWORD' });
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[otp] = Date.now();
      Object.keys(otpStore).forEach(k => { if (Date.now() - otpStore[k] > 300000) delete otpStore[k]; });
      await sendSMS('+1' + ADMIN_PHONE, `J.A.R.V.I.S ADMIN CODE: ${otp} (expires in 5 minutes)`);
      return res.status(200).json({ ok: true });
    }

    if (action === 'verify_otp') {
      const stored = otpStore[payload.otp];
      if (!stored) return res.status(401).json({ error: 'INVALID OR EXPIRED CODE' });
      if (Date.now() - stored > 300000) {
        delete otpStore[payload.otp];
        return res.status(401).json({ error: 'CODE EXPIRED — REQUEST NEW ONE' });
      }
      delete otpStore[payload.otp];
      return res.status(200).json({ ok: true });
    }

    if (action === 'get_operators') {
      const data = await sbFetch('operators?order=created_at.desc');
      return res.status(200).json({ data });
    }

    if (action === 'get_chats') {
      const data = await sbFetch(`chat_history?email=eq.${encodeURIComponent(payload.email)}&limit=1`);
      return res.status(200).json({ data: data[0] || null });
    }

    if (action === 'get_stats') {
      const operators = await sbFetch('operators?select=email,created_at,preferred_mode');
      const chats = await sbFetch('chat_history?select=email,messages,updated_at');
      const contacts = await sbFetch('contacts?select=email');
      const totalMessages = chats.reduce((sum, c) => sum + (c.messages ? c.messages.length : 0), 0);
      const modes = {};
      operators.forEach(function(op) { if (op.preferred_mode) modes[op.preferred_mode] = (modes[op.preferred_mode] || 0) + 1; });
      return res.status(200).json({
        data: {
          totalOperators: operators.length,
          totalMessages: totalMessages,
          totalContacts: contacts.length,
          topModes: Object.entries(modes).sort(function(a,b){ return b[1]-a[1]; }).slice(0,5),
          recentOperators: operators.slice(0,5)
        }
      });
    }

    if (action === 'delete_operator') {
      await fetch(`${SUPABASE_URL}/rest/v1/operators?email=eq.${encodeURIComponent(payload.email)}`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/chat_history?email=eq.${encodeURIComponent(payload.email)}`, { method: 'DELETE', headers: sbHeaders });
      await fetch(`${SUPABASE_URL}/rest/v1/contacts?email=eq.${encodeURIComponent(payload.email)}`, { method: 'DELETE', headers: sbHeaders });
      return res.status(200).json({ ok: true });
    }

    if (action === 'broadcast_sms') {
      const operators = await sbFetch('operators?select=email');
      return res.status(200).json({ ok: true, count: operators.length });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
