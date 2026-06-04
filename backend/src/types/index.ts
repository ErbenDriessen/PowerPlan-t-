export type JwtPayload = { userId: number };

export type UserPublic = { id: number; username: string; createdAt: Date };

export type BuddyWithOther = {
  id: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  other: UserPublic;
  isRequester: boolean;
};
