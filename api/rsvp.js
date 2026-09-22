const { kv } = require('@vercel/kv');

function clean(value, max) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name, attending, guests, attendeeNames } = body;

    if (!name || typeof name !== 'string' || !attending || !attendeeNames) {
      res.status(400).json({ error: 'missing_fields' });
      return;
    }

    const entry = {
      name: clean(name, 200),
      attending: attending === 'si' ? 'si' : 'no',
      guests: Math.max(1, Math.min(5, Number(guests) || 1)),
      attendeeNames: clean(attendeeNames, 500),
      question: clean(body.question, 500),
      createdAt: new Date().toISOString(),
    };

    await kv.rpush('rsvp:list', JSON.stringify(entry));
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
};
