// ============================================
// Supabase Client Configuration
// Ganti dengan kredensial project Anda
// ============================================

const SUPABASE_URL = 'https://ykgpwapnoimkkpnredhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3B3YXBub2lta2twbnJlZGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjQ2NDgsImV4cCI6MjA5NjE0MDY0OH0.GDolvVsB2f6BKEAW9poZBp_iSrsvWJgumIcqdomBS08';

// Gunakan Supabase dari CDN global (window.supabase)
const { createClient } = window.supabase;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
