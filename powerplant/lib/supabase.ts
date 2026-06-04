// powerplant/lib/supabase.ts
//
// Supabase-client voor de buddy-functie. Hiermee werkt de buddy-koppeling
// vanaf elk toestel — er hoeft geen lokale server of LAN-IP meer ingesteld
// te worden.
//
// >>> VUL HIERONDER JE EIGEN PROJECT-GEGEVENS IN <<<
// Te vinden in het Supabase-dashboard onder:  Project Settings -> API
//   - "Project URL"                 ->  SUPABASE_URL
//   - "Project API keys" -> "anon"  ->  SUPABASE_ANON_KEY
//
// De anon-key mag gerust in de code staan: hij is bedoeld om publiek te zijn.
// Je data wordt beschermd door de Row Level Security-regels uit
// supabase/schema.sql, niet door de key geheim te houden.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://uwqesjeeofpcnhbldfgp.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cWVzamVlb2ZwY25oYmxkZmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODA3NzMsImV4cCI6MjA5NTk1Njc3M30.JRCPzyci7hx1b5ijcksMyBDkfwIdCG9b28Ud97QTTRw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // In een mobiele app komt de sessie niet via de URL binnen.
    detectSessionInUrl: false,
  },
});
