// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// URL ve anahtarın .env.local dosyasında tanımlandığından emin olmak için kontrol
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and/or Anon Key is missing from .env.local file"
  );
}

// Supabase istemcisini oluştur ve export et
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
