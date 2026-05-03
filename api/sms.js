export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { since } = req.body || {};
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const myNumber   = process.env.TWILIO_PHONE_NUMBER;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?To=${encodeURIComponent(myNumber)}&PageSize=50`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });

    const data = await response.json();
    if (!data.messages) return res.status(200).json({ messages: [] });

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000);
    const newMessages = data.messages
      .filter(m => m.direction === 'inbound' && new Date(m.date_sent) > sinceDate)
      .map(m => ({ from: m.from, body: m.body, date: m.date_sent, sid: m.sid }));

    res.status(200).json({ messages: newMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
