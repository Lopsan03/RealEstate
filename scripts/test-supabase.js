import { createClient } from '@supabase/supabase-js';

const url = 'https://bwivpdyljqmdpxdqctee.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aXZwZHlsanFtZHB4ZHFjdGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5ODc1MDQsImV4cCI6MjA4MzU2MzUwNH0.lEyluwPVazzur5cnOeKlpXozRmscGeaOIWMmQuPEheE';

const supabase = createClient(url, anon);

try {
  const { data, error } = await supabase.from('properties').select('*').limit(5);
  console.log('error:', error);
  console.log('data:', data);
} catch (err) {
  console.error('unexpected error', err);
}
