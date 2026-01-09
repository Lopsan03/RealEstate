import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query as { id: string };

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('properties').select('*').eq('id', id).limit(1).single();
      if (error) return res.status(404).json({ error: error.message });
      return res.status(200).json(data);
    }

    // Protected
    const adminPass = req.headers['x-admin-pass'] as string | undefined;
    if (adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'PUT') {
      const payload = req.body;
      const { data, error } = await supabase.from('properties').update(payload).eq('id', id).select().limit(1);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data[0]);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
