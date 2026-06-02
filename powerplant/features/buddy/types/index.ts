// Supabase gebruikt UUID's als sleutels, dus alle id's zijn strings.
export type User = {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
};

export type BuddyStatus = 'pending' | 'accepted' | 'blocked';

export type Buddy = {
  id: string;
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
  id: string;
  buddyId: string;
  senderId: string;
  body: string;
  type: string;
  sentAt: string;
  pending?: boolean;
};
