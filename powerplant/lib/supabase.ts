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
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://agsbniffixvbqtfephdn.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_vObW14Rv8Y5LDPBsGL4jWg_TTuMV4cG";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // In een mobiele app komt de sessie niet via de URL binnen.
    detectSessionInUrl: false,
  },
});
