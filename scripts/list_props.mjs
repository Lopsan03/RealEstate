import { createClient } from '@supabase/supabase-js';

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as environment variables.');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('properties').select('id,title,price').order('created_at', { ascending: false }).limit(10);
  if (error) {
    console.error('Error fetching properties:', error);
    process.exit(1);
  }
  console.log('Fetched properties:', data);
}

main();
