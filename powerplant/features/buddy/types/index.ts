// profiles.id is altijd een UUID (vastgezet door Supabase Auth).
// buddies.id en messages.id zijn bigserial — gewone oplopende getallen.
export type User = {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
};

export type BuddyStatus = 'pending' | 'accepted' | 'blocked';

export type Buddy = {
  id: number;
  status: BuddyStatus;
  createdAt: string;
  other: {
    id: string;
    username: string;
    createdAt: string;
  };
  isRequester: boolean;
};

export type Message = {
  id: number;
  buddyId: number;
  senderId: string;
  body: string;
  type: string;
  sentAt: string;
  pending?: boolean;
};
