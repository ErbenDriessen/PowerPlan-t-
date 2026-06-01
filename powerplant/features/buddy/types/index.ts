export type User = {
  id: number;
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
    id: number;
    username: string;
    createdAt: string;
  };
  isRequester: boolean;
};

export type Message = {
  id: number | string;
  buddyId: number;
  senderId: number;
  body: string;
  type: string;
  sentAt: string;
  pending?: boolean;
};
