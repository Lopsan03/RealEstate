import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as environment variables.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const filePath = path.join(process.cwd(), 'data', 'properties_seed.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const propsRaw = JSON.parse(raw);
  const props = propsRaw.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    location: p.location,
    description: p.description,
    beds: p.beds,
    baths: p.baths,
    sqft_construction: p.sqftConstruction,
    sqft_land: p.sqftLand,
    parking: p.parking,
    images: p.images,
    video_url: p.video_url || null,
    status: p.status || 'Available',
    is_active: p.isActive === undefined ? true : p.isActive,
    // The properties table stores created_at as bigint (epoch ms). Send an integer.
    created_at: Math.floor(new Date(p.createdAt || Date.now()).getTime())
  }));

  try {
    console.log(`Upserting ${props.length} properties into table 'properties'...`);
    const { data, error } = await supabase.from('properties').upsert(props, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsert error:', error);
      process.exit(1);
    }
    console.log('Upsert successful.');
    if (Array.isArray(data)) {
      console.log('Upserted rows count:', data.length);
    }
  } catch (err) {
    console.error('Unexpected error during migration:', err);
    process.exit(1);
  }
}

main();
