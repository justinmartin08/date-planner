export type UserTheme = 'tiger' | 'pokemon';

export interface UserSession {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  theme: UserTheme;
}

export interface DateProposalItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  status: 'PROPOSED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  creatorId: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    theme: UserTheme;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentItem {
  id: string;
  kind: 'file' | 'voice';
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  duration?: number | null;
}

export interface MessageItem {
  id: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    theme: UserTheme;
  };
  recipientId: string;
  recipient: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    theme: UserTheme;
  };
  title?: string | null;
  content: string;
  contentHtml?: string | null;
  attachments?: AttachmentItem[];
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type WishlistStatus = 'ACTIVE' | 'CLAIMED' | 'GRANTED';

export interface WishlistItem {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  price?: number | null;
  currency: string;
  category: string;
  priority: number; // 1, 2, or 3
  imageUrl?: string | null;
  status: WishlistStatus;
  ownerId: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    theme: UserTheme;
  };
  creatorId: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    theme: UserTheme;
  };
  claimedById?: string | null;
  claimedBy?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  claimedAt?: string | null;
  grantedAt?: string | null;
  grantedNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

