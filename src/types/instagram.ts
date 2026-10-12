export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  avatar: string;
  isVerified?: boolean;
  bio?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  interests?: string[];
  followingUserIds?: string[];
  createdAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likesCount: number;
  hasLiked?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  location?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likesCount: number;
  hasLiked: boolean;
  isBookmarked: boolean;
  commentsCount: number;
  comments: Comment[];
  timestamp: string;
  filter?: string;
  aspectRatio?: '1:1' | '4:5' | '16:9';
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  duration?: number; // in seconds, default 5
  hasSeen?: boolean;
  caption?: string;
  createdAt?: string;
  expiresAt?: string;
  expiresAtTimestamp?: number;
  filter?: string;
  stickers?: string[];
}

export interface UserStoriesGroup {
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  stories: Story[];
  allSeen: boolean;
}

export interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  caption: string;
  videoUrl: string;
  audioTrack: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
  likesCount: number;
  hasLiked: boolean;
  commentsCount: number;
  comments: Comment[];
  sharesCount: number;
  isBookmarked: boolean;
  isFollowing: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  actor: {
    id: string;
    username: string;
    avatar: string;
  };
  targetMediaUrl?: string;
  text?: string;
  timestamp: string;
  isRead: boolean;
  isFollowing?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  hasLiked?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: DirectMessage[];
}

export interface Highlight {
  id: string;
  title: string;
  coverUrl: string;
  stories: Story[];
}

export type ActiveTab = 'home' | 'search' | 'explore' | 'reels' | 'messages' | 'notifications' | 'create' | 'profile';
