import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const SUPABASE_URL = 'https://kijspkuybytbrzswqxcq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpanNwa3V5Ynl0YnJ6c3dxeGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDY1OTYsImV4cCI6MjA4MzkyMjU5Nn0.qUT8ospE2IiZHU01Hk4oXq7hwaHpn-ZOVBQmbb3cunQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);