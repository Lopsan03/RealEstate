import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      console.error('ADMIN_PASSWORD not set on server');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    if (password === expected) {
      return res.status(200).json({ ok: true });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
