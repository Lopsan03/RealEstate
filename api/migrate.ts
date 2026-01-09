import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const adminPass = req.headers['x-admin-pass'] as string | undefined;
    if (adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const props = req.body;
    if (!Array.isArray(props)) return res.status(400).json({ error: 'Expected an array of properties' });

    const { data, error } = await supabase.from('properties').upsert(props);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ inserted: data.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
