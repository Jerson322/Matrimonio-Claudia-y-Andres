const { Redis } = require('@upstash/redis');
const kv = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const key = req.query.key;
  if (!key || !process.env.ADMIN_PASSWORD || key !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const raw = await kv.lrange('rsvp:list', 0, -1);
    const entries = raw
      .map((item) => {
        try {
          return typeof item === 'string' ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();

    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
};
