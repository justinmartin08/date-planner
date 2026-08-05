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
