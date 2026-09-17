const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name, attending, guests, message } = body;

    if (!name || typeof name !== 'string' || !attending) {
      res.status(400).json({ error: 'missing_fields' });
      return;
    }

    const entry = {
      name: name.slice(0, 200),
      attending: attending === 'si' ? 'si' : 'no',
      guests: Math.max(1, Math.min(10, Number(guests) || 1)),
      message: typeof message === 'string' ? message.slice(0, 500) : '',
      createdAt: new Date().toISOString(),
    };

    await kv.rpush('rsvp:list', JSON.stringify(entry));
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
};
