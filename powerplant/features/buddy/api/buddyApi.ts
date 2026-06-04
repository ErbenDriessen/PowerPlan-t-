// powerplant/features/buddy/api/buddyApi.ts
//
// Data-laag voor de buddy-functie, bovenop Supabase.
//
// De functienamen en hun resultaten zijn identiek gebleven aan de oude
// REST-versie, zodat de schermen (login, register, chat, account, buddy-tab)
// ongewijzigd blijven werken. Alleen de id's zijn nu UUID's (string).
import { supabase } from "../../../lib/supabase";
import type { Buddy, Message, User } from "../types";

// --- Hulpfuncties ----------------------------------------------------------

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Je bent niet ingelogd");
  return data.user.id;
}

type ProfileRow = { id: string; username: string; created_at: string };

type MessageRow = {
  id: number;
  buddy_id: number;
  sender_id: string;
  body: string;
  type: string;
  sent_at: string;
};

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    buddyId: row.buddy_id,
    senderId: row.sender_id,
    body: row.body,
    type: row.type,
    sentAt: row.sent_at,
  };
}

// Vertaalt technische Supabase-fouten naar nette Nederlandse meldingen.
function friendly(message: string): string {
  if (/Invalid login credentials/i.test(message)) return "E-mail of wachtwoord klopt niet";
  if (/already registered|already exists/i.test(message)) return "Dit e-mailadres is al in gebruik";
  if (/duplicate key.*username|profiles_username/i.test(message))
    return "Deze gebruikersnaam is al bezet";
  if (/Email not confirmed/i.test(message)) return "Je account is nog niet bevestigd";
  if (/Password should be/i.test(message)) return "Wachtwoord is te kort of te zwak";
  return message;
}

// --- Sessie (compat met de oude API) --------------------------------------
// Supabase bewaart de sessie zelf (in AsyncStorage). Deze functies blijven
// bestaan zodat de schermen niet aangepast hoeven te worden.

export async function saveToken(_token: string): Promise<void> {
  /* no-op: Supabase beheert de sessie zelf */
}

export async function clearToken(): Promise<void> {
  await supabase.auth.signOut();
}

// --- Auth ------------------------------------------------------------------

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // De gebruikersnaam wordt door een database-trigger in het profiel gezet.
    options: { data: { username } },
  });
  if (error) throw new Error(friendly(error.message));
  if (!data.user) throw new Error("Registreren mislukt");
  if (!data.session) {
    throw new Error(
      "Account aangemaakt, maar e-mailbevestiging staat nog aan. Zet die uit in Supabase " +
        '(Authentication -> Sign In / Providers -> Email -> "Confirm email" uit) om direct in te loggen.',
    );
  }
  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      username,
      email: data.user.email ?? email,
      createdAt: data.user.created_at ?? new Date().toISOString(),
    },
  };
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendly(error.message));
  const user = await getMe();
  return { token: data.session?.access_token ?? "", user };
}

// --- Users -----------------------------------------------------------------

export async function getMe(): Promise<User> {
  const { data: auth, error } = await supabase.auth.getUser();
  if (error || !auth.user) throw new Error("Je bent niet ingelogd");
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, username, created_at")
    .eq("id", auth.user.id)
    .single<ProfileRow>();
  if (pErr) throw new Error(friendly(pErr.message));
  return {
    id: profile.id,
    username: profile.username,
    email: auth.user.email ?? undefined,
    createdAt: profile.created_at,
  };
}

export async function updateMe(data: {
  username?: string;
  password?: string;
  currentPassword?: string;
}): Promise<User> {
  const me = await currentUserId();
  if (data.username) {
    const { error } = await supabase
      .from("profiles")
      .update({ username: data.username })
      .eq("id", me);
    if (error) throw new Error(friendly(error.message));
  }
  if (data.password) {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) throw new Error(friendly(error.message));
  }
  return getMe();
}

export async function deleteMe(): Promise<void> {
  const me = await currentUserId();
  // Het volledig verwijderen van het auth-account vereist serverrechten.
  // We verwijderen hier het profiel — buddy's en berichten verdwijnen mee via
  // de cascade-regels in de database — en loggen daarna uit.
  await supabase.from("profiles").delete().eq("id", me);
  await supabase.auth.signOut();
}

export async function getMyGoals(): Promise<string[]> {
  const { data: auth, error } = await supabase.auth.getUser();
  if (error || !auth.user) throw new Error("Je bent niet ingelogd");
  const { data, error: pErr } = await supabase
    .from("profiles")
    .select("goals")
    .eq("id", auth.user.id)
    .single<{ goals: string[] }>();
  if (pErr) throw new Error(friendly(pErr.message));
  return data?.goals ?? [];
}

export async function syncGoals(goals: string[]): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("profiles")
    .update({ goals })
    .eq("id", me);
  if (error) throw new Error(friendly(error.message));
}

export async function findMatchingUsers(
  myGoals: string[],
): Promise<{ id: string; username: string; goals: string[] }[]> {
  if (myGoals.length === 0) return [];
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, goals")
    .overlaps("goals", myGoals)
    .neq("id", me)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(friendly(error.message));
  return (data ?? []) as { id: string; username: string; goals: string[] }[];
}

// --- Buddies ---------------------------------------------------------------

// Haalt bij elke buddy-rij meteen de profielen van beide kanten op, zodat we
// weten wie "de ander" is.
const BUDDY_SELECT = `
  id, status, created_at, requester_id, receiver_id,
  requester:profiles!buddies_requester_id_fkey ( id, username, created_at ),
  receiver:profiles!buddies_receiver_id_fkey ( id, username, created_at )
`;

type BuddyRow = {
  id: number;
  status: Buddy["status"];
  created_at: string;
  requester_id: string;
  receiver_id: string;
  requester: ProfileRow;
  receiver: ProfileRow;
};

function mapBuddy(row: BuddyRow, me: string): Buddy {
  const isRequester = row.requester_id === me;
  const other = isRequester ? row.receiver : row.requester;
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    other: { id: other.id, username: other.username, createdAt: other.created_at },
    isRequester,
  };
}

export async function getBuddies(): Promise<Buddy[]> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("buddies")
    .select(BUDDY_SELECT)
    .or(`requester_id.eq.${me},receiver_id.eq.${me}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(friendly(error.message));
  return ((data ?? []) as unknown as BuddyRow[]).map((r) => mapBuddy(r, me));
}

export async function sendBuddyRequest(receiverId: string): Promise<Buddy> {
  const me = await currentUserId();
  if (receiverId === me) throw new Error("Je kunt jezelf niet toevoegen");
  const { data, error } = await supabase
    .from("buddies")
    .insert({ requester_id: me, receiver_id: receiverId })
    .select(BUDDY_SELECT)
    .single();
  if (error) {
    if (/duplicate key/i.test(error.message)) throw new Error("Je hebt deze buddy al uitgenodigd");
    throw new Error(friendly(error.message));
  }
  return mapBuddy(data as unknown as BuddyRow, me);
}

export async function updateBuddyStatus(
  buddyId: number,
  status: "accepted" | "blocked",
): Promise<Buddy> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("buddies")
    .update({ status })
    .eq("id", buddyId)
    .select(BUDDY_SELECT)
    .single();
  if (error) throw new Error(friendly(error.message));
  return mapBuddy(data as unknown as BuddyRow, me);
}

// --- Messages --------------------------------------------------------------

export async function getMessages(buddyId: number, since?: string): Promise<Message[]> {
  let query = supabase
    .from("messages")
    .select("id, buddy_id, sender_id, body, type, sent_at")
    .eq("buddy_id", buddyId)
    .order("sent_at", { ascending: true });
  if (since) query = query.gt("sent_at", since);
  const { data, error } = await query;
  if (error) throw new Error(friendly(error.message));
  return ((data ?? []) as MessageRow[]).map(mapMessage);
}

export async function sendMessage(buddyId: number, body: string, type = "text"): Promise<Message> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("messages")
    .insert({ buddy_id: buddyId, sender_id: me, body, type })
    .select("id, buddy_id, sender_id, body, type, sent_at")
    .single<MessageRow>();
  if (error) throw new Error(friendly(error.message));
  return mapMessage(data);
}
