import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  UserStoriesGroup,
  Reel,
  NotificationItem,
  ChatThread,
  Highlight,
  ActiveTab,
  Comment,
  Story,
  DirectMessage,
} from '../types/instagram';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_STORIES_GROUPS,
  INITIAL_REELS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_THREADS,
  USER_HIGHLIGHTS,
  EXPLORE_POSTS,
} from '../data/mockData';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export const CREATE_ZERO_USER = (overrides?: Partial<User>): User => ({
  id: `user_${Date.now()}`,
  username: 'new_explorer',
  fullName: 'New Explorer',
  email: 'explorer@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  isVerified: false,
  bio: '📸 Just joined InTube! Exploring visual stories ✨',
  website: '',
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowing: false,
  interests: ['Photography', 'Travel'],
  followingUserIds: [], // Zero follows initially!
  createdAt: 'Just now',
  ...overrides,
});

interface InstagramContextType {
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
  allCreators: User[];
  isFollowingUser: (userId: string) => boolean;
  toggleFollowUser: (userId: string) => void;
  followToast: { message: string; username: string; avatar: string; isFollowing: boolean; userId: string } | null;
  dismissFollowToast: () => void;
  undoFollow: () => void;

  // User Profile Modal
  selectedUserIdForModal: string | null;
  openUserProfile: (userId: string) => void;
  closeUserProfile: () => void;

  // Post Likes Modal
  activePostIdForLikesModal: string | null;
  openPostLikesModal: (postId: string) => void;
  closePostLikesModal: () => void;

  // Follow List Modals
  followListModal: { isOpen: boolean; mode: 'followers' | 'following'; user: User } | null;
  openFollowersModal: (user?: User) => void;
  openFollowingModal: (user?: User) => void;
  closeFollowListModal: () => void;

  // Posts & Algorithmic Feed
  allPosts: Post[];
  homeFeedPosts: Post[];
  userPosts: Post[];
  savedPosts: Post[];
  savedPostIds: string[];
  saveToast: { message: string; show: boolean; isSaved?: boolean; postId?: string } | null;
  dismissSaveToast: () => void;
  profileTab: 'posts' | 'reels' | 'saved' | 'tagged';
  setProfileTab: (tab: 'posts' | 'reels' | 'saved' | 'tagged') => void;
  toggleLikePost: (postId: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  addCommentToPost: (postId: string, text: string) => void;
  deletePost: (postId: string) => void;
  createPost: (post: Omit<Post, 'id' | 'userId' | 'username' | 'userAvatar' | 'likesCount' | 'hasLiked' | 'isBookmarked' | 'commentsCount' | 'comments' | 'timestamp'>) => void;
  
  // Stories & Seen Algorithm
  allStoriesGroups: UserStoriesGroup[];
  activeStoriesGroups: UserStoriesGroup[];
  markStoriesSeen: (userId: string) => void;
  addStory: (mediaUrl: string, caption?: string, filter?: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  isStoryCreatorOpen: boolean;
  setIsStoryCreatorOpen: (open: boolean) => void;
  viewingStoryUserId: string | null;
  setViewingStoryUserId: (userId: string | null) => void;

  // Reels
  reels: Reel[];
  toggleLikeReel: (reelId: string) => void;
  toggleBookmarkReel: (reelId: string) => void;
  toggleFollowReelUser: (userId: string) => void;
  addCommentToReel: (reelId: string, text: string) => void;
  createReel: (videoUrl: string, caption: string, audioTitle?: string) => void;

  // Direct Messages
  chatThreads: ChatThread[];
  activeChatId: string | null;
  setActiveChatId: (threadId: string | null) => void;
  sendMessage: (threadId: string, text: string, mediaUrl?: string) => void;
  toggleMessageLike: (threadId: string, messageId: string) => void;
  createChatWithUser: (user: User) => string;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  toggleFollowNotificationUser: (actorId: string) => void;
  triggerLiveActivity: (customType?: 'like' | 'follow' | 'comment') => void;

  // Highlights & Explore
  highlights: Highlight[];
  addHighlight: (title: string, coverUrl: string) => void;
  explorePosts: Post[];

  // Registration & Zero State Auth
  registerUser: (data: { username: string; fullName: string; email?: string; avatar?: string; bio?: string; interests?: string[] }) => void;
  loginUser: (usernameOrEmail: string) => void;
  resetToZeroAccount: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Navigation & UI
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  selectedPostForDetail: Post | null;
  setSelectedPostForDetail: (post: Post | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  shareModalData: { title: string; url: string; image?: string } | null;
  setShareModalData: (data: { title: string; url: string; image?: string } | null) => void;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
}

const InstagramContext = createContext<InstagramContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'intube_current_user_v2',
  CREATORS: 'intube_creators_v2',
  POSTS: 'intube_posts_v2',
  STORIES: 'intube_stories_v2',
  REELS: 'intube_reels_v2',
  NOTIFICATIONS: 'intube_notifications_v2',
  CHATS: 'intube_chats_v2',
  THEME: 'intube_theme_v2',
};

export const InstagramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user starts with clean zero-state (0 followers, 0 following, 0 posts)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return CREATE_ZERO_USER();
  });

  const [allCreators, setAllCreators] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREATORS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [allPosts, setAllPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [allStoriesGroups, setAllStoriesGroups] = useState<UserStoriesGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
    return saved ? JSON.parse(saved) : INITIAL_STORIES_GROUPS;
  });

  const [reels, setReels] = useState<Reel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REELS);
    return saved ? JSON.parse(saved) : INITIAL_REELS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_THREADS;
  });

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [profileTab, setProfileTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewingStoryUserId, setViewingStoryUserId] = useState<string | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ title: string; url: string; image?: string } | null>(null);

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('intube_saved_post_ids_v3');
    return saved ? JSON.parse(saved) : ['post_2'];
  });

  const [saveToast, setSaveToast] = useState<{ message: string; show: boolean; isSaved?: boolean; postId?: string } | null>(null);
  const [followToast, setFollowToast] = useState<{
    message: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
    userId: string;
  } | null>(null);

  const [selectedUserIdForModal, setSelectedUserIdForModal] = useState<string | null>(null);
  const [activePostIdForLikesModal, setActivePostIdForLikesModal] = useState<string | null>(null);
  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    mode: 'followers' | 'following';
    user: User;
  } | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  // LocalStorage syncing
  useEffect(() => {
    localStorage.setItem('intube_saved_post_ids_v3', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(allCreators));
  }, [allCreators]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(allPosts));
  }, [allPosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(allStoriesGroups));
  }, [allStoriesGroups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(reels));
  }, [reels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chatThreads));
  }, [chatThreads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-black text-neutral-100 antialiased selection:bg-rose-500 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-neutral-50 text-neutral-900 antialiased selection:bg-rose-500 selection:text-white';
    }
  }, [theme]);

  // Real-time Firestore synchronization for 24-hour stories
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const pathForStories = 'stories';
    try {
      const storiesRef = collection(db, pathForStories);
      unsubscribe = onSnapshot(
        storiesRef,
        snapshot => {
          const now = Date.now();
          const remoteStories: Story[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // 24-hour expiration check: prune stories past expiration
            if (data.expiresAtTimestamp && data.expiresAtTimestamp <= now) {
              return;
            }
            remoteStories.push({
              id: data.id || docSnap.id,
              userId: data.userId,
              username: data.username,
              userAvatar: data.userAvatar,
              mediaUrl: data.mediaUrl,
              mediaType: data.mediaType || 'image',
              caption: data.caption || '',
              filter: data.filter || 'normal',
              createdAt: data.createdAt || new Date().toISOString(),
              expiresAt: data.expiresAt || new Date(now + 24 * 3600 * 1000).toISOString(),
              expiresAtTimestamp: data.expiresAtTimestamp || (now + 24 * 3600 * 1000),
              timestamp: 'Live · 24h',
              duration: 5,
              hasSeen: false,
            });
          });

          if (remoteStories.length > 0) {
            setAllStoriesGroups(prev => {
              const groupsMap = new Map<string, UserStoriesGroup>();
              // Keep non-conflicting existing groups
              prev.forEach(g => {
                groupsMap.set(g.userId, { ...g, stories: [...g.stories] });
              });

              remoteStories.forEach(remoteStory => {
                const group = groupsMap.get(remoteStory.userId);
                if (group) {
                  const exists = group.stories.some(s => s.id === remoteStory.id);
                  if (!exists) {
                    group.stories.unshift(remoteStory);
                    group.allSeen = false;
                  }
                } else {
                  groupsMap.set(remoteStory.userId, {
                    userId: remoteStory.userId,
                    username: remoteStory.username,
                    userAvatar: remoteStory.userAvatar,
                    isVerified: false,
                    stories: [remoteStory],
                    allSeen: false,
                  });
                }
              });

              return Array.from(groupsMap.values());
            });
          }
        },
        error => {
          handleFirestoreError(error, OperationType.GET, pathForStories);
        }
      );
    } catch (err) {
      console.warn('Firestore onSnapshot listener error:', err);
    }

    return () => unsubscribe();
  }, []);

  // Periodic pruning of stories expired after 24 hours
  useEffect(() => {
    const pruneExpiredStories = () => {
      const now = Date.now();
      setAllStoriesGroups(prev =>
        prev
          .map(group => ({
            ...group,
            stories: group.stories.filter(s => {
              if (s.expiresAtTimestamp && s.expiresAtTimestamp <= now) {
                return false;
              }
              return true;
            }),
          }))
          .filter(group => group.stories.length > 0)
      );
    };

    const interval = setInterval(pruneExpiredStories, 60000);
    return () => clearInterval(interval);
  }, []);

  // Real-time live engagement simulation for posts in feed
  useEffect(() => {
    const interval = setInterval(() => {
      setAllPosts(prev => {
        if (prev.length === 0) return prev;
        const randomIndex = Math.floor(Math.random() * prev.length);
        const shouldAddLike = Math.random() > 0.35; // 65% likes, 35% comments
        const targetPost = prev[randomIndex];

        const sampleComments = [
          'Stunning capture! 🔥',
          'Pure vibes 🙌',
          'Love this framing ✨',
          'Incredible aesthetic 📸',
          'Top tier shot 👏',
          'Goals! ❤️',
        ];
        const randomSample = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const randomUsers = [
          { id: 'user_1', username: 'rohit_photography', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
          { id: 'user_4', username: 'priya_styles', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
          { id: 'user_3', username: 'aarav_vfx', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
          { id: 'user_2', username: 'ananya_wanderlust', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
        ];
        const chosenUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];

        // Generate real-time activity notification
        const notifType: 'like' | 'comment' | 'follow' = shouldAddLike
          ? 'like'
          : Math.random() > 0.4
          ? 'comment'
          : 'follow';

        const liveNotif: NotificationItem = {
          id: `notif_act_${Date.now()}`,
          type: notifType,
          actor: {
            id: chosenUser.id,
            username: chosenUser.username,
            avatar: chosenUser.avatar,
          },
          targetMediaUrl: notifType !== 'follow' ? targetPost.mediaUrl : undefined,
          text: notifType === 'comment' ? randomSample : undefined,
          timestamp: 'Just now',
          isRead: false,
        };

        setNotifications(prevNotifs => [liveNotif, ...prevNotifs.slice(0, 45)]);

        return prev.map((post, idx) => {
          if (idx !== randomIndex) return post;

          if (shouldAddLike) {
            return {
              ...post,
              likesCount: post.likesCount + 1,
            };
          } else {
            const newSimComment: Comment = {
              id: `c_live_${Date.now()}`,
              userId: chosenUser.id,
              username: chosenUser.username,
              userAvatar: chosenUser.avatar,
              text: randomSample,
              timestamp: 'Just now',
              likesCount: 1,
            };

            return {
              ...post,
              commentsCount: post.commentsCount + 1,
              comments: [newSimComment, ...post.comments],
            };
          }
        });
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  // Follow / Unfollow logic
  const isFollowingUser = (userId: string) => {
    return (currentUser.followingUserIds || []).includes(userId);
  };

  const dismissFollowToast = () => setFollowToast(null);

  const undoFollow = () => {
    if (followToast?.userId) {
      const targetId = followToast.userId;
      setFollowToast(null);
      toggleFollowUser(targetId);
    }
  };

  const openUserProfile = (userId: string) => {
    setSelectedUserIdForModal(userId);
  };

  const closeUserProfile = () => {
    setSelectedUserIdForModal(null);
  };

  const openPostLikesModal = (postId: string) => {
    setActivePostIdForLikesModal(postId);
  };

  const closePostLikesModal = () => {
    setActivePostIdForLikesModal(null);
  };

  const openFollowersModal = (targetUser?: User) => {
    setFollowListModal({
      isOpen: true,
      mode: 'followers',
      user: targetUser || currentUser,
    });
  };

  const openFollowingModal = (targetUser?: User) => {
    setFollowListModal({
      isOpen: true,
      mode: 'following',
      user: targetUser || currentUser,
    });
  };

  const closeFollowListModal = () => {
    setFollowListModal(null);
  };

  const toggleFollowUser = (userId: string) => {
    const currentlyFollowing = isFollowingUser(userId);
    const targetCreator = allCreators.find(c => c.id === userId);
    const targetUsername = targetCreator?.username || 'creator';
    const targetAvatar = targetCreator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

    if (currentlyFollowing) {
      // Unfollow
      const updatedFollowing = (currentUser.followingUserIds || []).filter(id => id !== userId);
      setCurrentUser(prev => ({
        ...prev,
        followingUserIds: updatedFollowing,
        followingCount: Math.max(0, prev.followingCount - 1),
      }));

      setAllCreators(prev =>
        prev.map(c => (c.id === userId ? { ...c, followersCount: Math.max(0, c.followersCount - 1), isFollowing: false } : c))
      );

      setFollowToast({
        message: `Unfollowed @${targetUsername}`,
        username: targetUsername,
        avatar: targetAvatar,
        isFollowing: false,
        userId,
      });
    } else {
      // Follow
      const updatedFollowing = [...(currentUser.followingUserIds || []), userId];
      setCurrentUser(prev => ({
        ...prev,
        followingUserIds: updatedFollowing,
        followingCount: prev.followingCount + 1,
      }));

      setAllCreators(prev =>
        prev.map(c => (c.id === userId ? { ...c, followersCount: c.followersCount + 1, isFollowing: true } : c))
      );

      setFollowToast({
        message: `Now following @${targetUsername}`,
        username: targetUsername,
        avatar: targetAvatar,
        isFollowing: true,
        userId,
      });

      // Add a realistic notification
      if (targetCreator) {
        const followNotif: NotificationItem = {
          id: `notif_f_${Date.now()}`,
          type: 'follow',
          actor: {
            id: targetCreator.id,
            username: targetCreator.username,
            avatar: targetCreator.avatar,
          },
          timestamp: 'Just now',
          isRead: false,
          isFollowing: true,
        };
        setNotifications(prev => [followNotif, ...prev]);
      }
    }
  };

  // Registration & Zero state
  const registerUser = (data: {
    username: string;
    fullName: string;
    email?: string;
    avatar?: string;
    bio?: string;
    interests?: string[];
  }) => {
    const newUser = CREATE_ZERO_USER({
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      avatar: data.avatar,
      bio: data.bio,
      interests: data.interests || ['Photography', 'Travel'],
      followingUserIds: [], // 0 following!
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    });

    setCurrentUser(newUser);
    // Add welcome notification
    const welcomeNotif: NotificationItem = {
      id: `notif_wel_${Date.now()}`,
      type: 'mention',
      actor: {
        id: 'system',
        username: 'intube_team',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      },
      text: `Welcome to InTube, @${newUser.username}! Explore creators and share your first visual story.`,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications([welcomeNotif]);
    setHighlights([]);
  };

  const loginUser = (usernameOrEmail: string) => {
    if (usernameOrEmail.toLowerCase().includes('sameer')) {
      // Preset demo creator account
      setCurrentUser({
        id: 'user_sameer',
        username: 'sameer_creatives',
        fullName: 'Sameer Sharma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        isVerified: true,
        bio: '📸 Visual Storyteller & Digital Explorer | Mumbai\n✨ Creating aesthetic visuals & reels',
        website: 'https://instagram.com',
        followersCount: 14200,
        followingCount: 4,
        postsCount: 2,
        followingUserIds: ['user_1', 'user_2', 'user_4'],
        interests: ['Photography', 'Travel', 'Tech'],
      });
    } else {
      // Log in as fresh or existing user
      setCurrentUser(prev => ({
        ...prev,
        username: usernameOrEmail.toLowerCase().replace(/\s+/g, '_'),
      }));
    }
  };

  const resetToZeroAccount = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    const zeroUser = CREATE_ZERO_USER();
    setCurrentUser(zeroUser);
    setNotifications([
      {
        id: `notif_wel_${Date.now()}`,
        type: 'mention',
        actor: {
          id: 'system',
          username: 'intube_team',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        },
        text: 'Welcome! Your account is brand-new (0 Followers, 0 Following). Follow creators to see their posts!',
        timestamp: 'Just now',
        isRead: false,
      },
    ]);
  };

  // Algorithmic Feed Computation
  const userPosts = allPosts.filter(p => p.userId === currentUser.id);

  // Home Feed:
  // Shows user's own posts + posts from users they actively follow!
  const followedPosts = allPosts.filter(
    p => (currentUser.followingUserIds || []).includes(p.userId) || p.userId === currentUser.id
  );

  // If user follows people, home feed has followed posts; otherwise empty or ready for onboarding discovery!
  const homeFeedPosts = followedPosts;

  // Stories:
  // Shows user's own story + followed users' stories (and featured creators so the tray is always vibrant!)
  const activeStoriesGroups = allStoriesGroups.filter(g => {
    if (g.userId === currentUser.id) return true;
    if ((currentUser.followingUserIds || []).includes(g.userId)) return true;
    return (currentUser.followingUserIds || []).length < 2;
  });

  // Post Actions
  const toggleLikePost = (postId: string) => {
    setAllPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          return {
            ...post,
            hasLiked,
            likesCount: hasLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      })
    );

    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(prev =>
        prev
          ? {
              ...prev,
              hasLiked: !prev.hasLiked,
              likesCount: !prev.hasLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
            }
          : null
      );
    }
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setAllPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                const hasLiked = !c.hasLiked;
                return {
                  ...c,
                  hasLiked,
                  likesCount: hasLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 0) - 1),
                };
              }
              return c;
            }),
          };
        }
        return p;
      })
    );

    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments.map(c => {
            if (c.id === commentId) {
              const hasLiked = !c.hasLiked;
              return {
                ...c,
                hasLiked,
                likesCount: hasLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 0) - 1),
              };
            }
            return c;
          }),
        };
      });
    }
  };

  // Deduplicated pool of posts for saved bookmarks
  const allPoolPosts = [...allPosts, ...EXPLORE_POSTS].filter(
    (post, index, self) => index === self.findIndex(p => p.id === post.id)
  );

  const savedPosts = allPoolPosts.filter(
    p => savedPostIds.includes(p.id) || p.isBookmarked
  );

  const dismissSaveToast = () => {
    setSaveToast(null);
  };

  const toggleBookmarkPost = (postId: string) => {
    const isCurrentlySaved = savedPostIds.includes(postId);
    const newSavedIds = isCurrentlySaved
      ? savedPostIds.filter(id => id !== postId)
      : [...savedPostIds, postId];

    setSavedPostIds(newSavedIds);

    // Show toast notification
    if (!isCurrentlySaved) {
      setSaveToast({ message: 'Saved to your profile', show: true, isSaved: true, postId });
    } else {
      setSaveToast({ message: 'Removed from Saved', show: true, isSaved: false, postId });
    }
    setTimeout(() => {
      setSaveToast(null);
    }, 3200);

    const existsInAll = allPosts.some(p => p.id === postId);
    if (!existsInAll) {
      const explorePost = EXPLORE_POSTS.find(p => p.id === postId);
      if (explorePost) {
        setAllPosts(prev => [{ ...explorePost, isBookmarked: !isCurrentlySaved }, ...prev]);
      }
    } else {
      setAllPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            return { ...post, isBookmarked: !isCurrentlySaved };
          }
          return post;
        })
      );
    }

    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(prev => (prev ? { ...prev, isBookmarked: !isCurrentlySaved } : null));
    }
  };

  const addCommentToPost = (postId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
    };

    setAllPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [newComment, ...post.comments],
          };
        }
        return post;
      })
    );

    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(prev =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
              comments: [newComment, ...prev.comments],
            }
          : null
      );
    }
  };

  const deletePost = (postId: string) => {
    setAllPosts(prev => prev.filter(p => p.id !== postId));
    setCurrentUser(prev => ({ ...prev, postsCount: Math.max(0, prev.postsCount - 1) }));
    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(null);
    }
  };

  const createPost = (
    postData: Omit<Post, 'id' | 'userId' | 'username' | 'userAvatar' | 'likesCount' | 'hasLiked' | 'isBookmarked' | 'commentsCount' | 'comments' | 'timestamp'>
  ) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      isVerified: currentUser.isVerified,
      likesCount: 0,
      hasLiked: false,
      isBookmarked: false,
      commentsCount: 0,
      comments: [],
      timestamp: 'JUST NOW',
      ...postData,
    };

    setAllPosts(prev => [newPost, ...prev]);
    setCurrentUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
  };

  // Stories Seen Algorithm
  const markStoriesSeen = (userId: string) => {
    setAllStoriesGroups(prev =>
      prev.map(group => {
        if (group.userId === userId) {
          return {
            ...group,
            allSeen: true,
            stories: group.stories.map(s => ({ ...s, hasSeen: true })),
          };
        }
        return group;
      })
    );
  };

  const addStory = async (mediaUrl: string, caption?: string, filter?: string) => {
    const storyId = `story_me_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiresAtTimestamp = expiresAt.getTime();

    const newStory: Story = {
      id: storyId,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      mediaUrl,
      mediaType: 'image',
      timestamp: 'Just now',
      duration: 5,
      hasSeen: false,
      caption: caption || '',
      filter: filter || 'normal',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      expiresAtTimestamp,
    };

    // Optimistic UI update
    setAllStoriesGroups(prev => {
      const existingMeIndex = prev.findIndex(g => g.userId === currentUser.id);
      if (existingMeIndex >= 0) {
        const updated = [...prev];
        updated[existingMeIndex] = {
          ...updated[existingMeIndex],
          allSeen: false,
          stories: [newStory, ...updated[existingMeIndex].stories],
        };
        return updated;
      } else {
        const myGroup: UserStoriesGroup = {
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatar,
          isVerified: currentUser.isVerified,
          allSeen: false,
          stories: [newStory],
        };
        return [myGroup, ...prev];
      }
    });

    // Real-time Firestore document creation adhering to firebase-blueprint and firestore.rules
    const pathForWrite = `stories/${storyId}`;
    try {
      await setDoc(doc(db, 'stories', storyId), {
        id: storyId,
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        mediaUrl,
        mediaType: 'image',
        caption: caption || '',
        filter: filter || 'normal',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        expiresAtTimestamp,
      });
    } catch (error) {
      console.error('Failed to sync story to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    }
  };

  const deleteStory = async (storyId: string) => {
    // Optimistic removal from state
    setAllStoriesGroups(prev =>
      prev
        .map(group => ({
          ...group,
          stories: group.stories.filter(s => s.id !== storyId),
        }))
        .filter(group => group.stories.length > 0)
    );

    const pathForDelete = `stories/${storyId}`;
    try {
      await deleteDoc(doc(db, 'stories', storyId));
    } catch (error) {
      console.warn('Could not delete story from Firestore:', error);
      handleFirestoreError(error, OperationType.DELETE, pathForDelete);
    }
  };

  // Reels
  const toggleLikeReel = (reelId: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const hasLiked = !r.hasLiked;
          return {
            ...r,
            hasLiked,
            likesCount: hasLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  const toggleBookmarkReel = (reelId: string) => {
    setReels(prev => {
      const targetReel = prev.find(r => r.id === reelId);
      const isNowSaved = targetReel ? !targetReel.isBookmarked : false;
      if (isNowSaved) {
        setSaveToast({ message: 'Reel saved to profile', show: true, isSaved: true });
      } else {
        setSaveToast({ message: 'Reel removed from Saved', show: true, isSaved: false });
      }
      setTimeout(() => setSaveToast(null), 3200);
      return prev.map(r => (r.id === reelId ? { ...r, isBookmarked: isNowSaved } : r));
    });
  };

  const toggleFollowReelUser = (userId: string) => {
    toggleFollowUser(userId);
    setReels(prev =>
      prev.map(r => (r.userId === userId ? { ...r, isFollowing: !r.isFollowing } : r))
    );
  };

  const addCommentToReel = (reelId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `rc_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
    };

    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newComment, ...r.comments],
          };
        }
        return r;
      })
    );
  };

  const createReel = (videoUrl: string, caption: string, audioTitle?: string) => {
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      isVerified: currentUser.isVerified,
      caption,
      videoUrl,
      audioTrack: {
        title: audioTitle || 'Original Audio - ' + currentUser.username,
        artist: currentUser.fullName,
        coverUrl: currentUser.avatar,
      },
      likesCount: 0,
      hasLiked: false,
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      isBookmarked: false,
      isFollowing: false,
    };

    setReels(prev => [newReel, ...prev]);
    setCurrentUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
  };

  // Direct Messaging with read status progression
  const sendMessage = (threadId: string, text: string, mediaUrl?: string) => {
    if (!text.trim() && !mediaUrl) return;

    const msgId = `msg_${Date.now()}`;
    const newMsg: DirectMessage = {
      id: msgId,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaUrl,
      status: 'sent',
    };

    setChatThreads(prev =>
      prev.map(th => {
        if (th.id === threadId) {
          return {
            ...th,
            lastMessage: text.trim() || 'Sent a photo',
            lastMessageTime: 'Now',
            messages: [...th.messages, newMsg],
          };
        }
        return th;
      })
    );

    // Progressive status: sent -> delivered
    setTimeout(() => {
      setChatThreads(curThreads =>
        curThreads.map(th => {
          if (th.id === threadId) {
            return {
              ...th,
              messages: th.messages.map(m =>
                m.id === msgId && m.status === 'sent' ? { ...m, status: 'delivered' } : m
              ),
            };
          }
          return th;
        })
      );
    }, 600);

    // Progressive status: delivered -> seen
    setTimeout(() => {
      setChatThreads(curThreads =>
        curThreads.map(th => {
          if (th.id === threadId) {
            return {
              ...th,
              messages: th.messages.map(m =>
                m.id === msgId ? { ...m, status: 'seen' } : m
              ),
            };
          }
          return th;
        })
      );
    }, 1100);

    // Realistic auto-reply simulation
    setTimeout(() => {
      const autoReplies = [
        'Hey! Sounds amazing 🔥',
        'Got it, will check it out in a bit!',
        'Loved your latest reel by the way! 🙌',
        'Haha totally agree with that 😂',
        'Let’s catch up soon!',
        'Super cool! 📸',
      ];
      const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const replyMsg: DirectMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: threadId,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads(curThreads =>
        curThreads.map(th => {
          if (th.id === threadId) {
            const updatedMessages = th.messages.map(m =>
              m.senderId === currentUser.id ? { ...m, status: 'seen' as const } : m
            );
            return {
              ...th,
              lastMessage: replyText,
              lastMessageTime: 'Now',
              messages: [...updatedMessages, replyMsg],
            };
          }
          return th;
        })
      );
    }, 1400);
  };

  const toggleMessageLike = (threadId: string, messageId: string) => {
    setChatThreads(prev =>
      prev.map(th => {
        if (th.id === threadId) {
          return {
            ...th,
            messages: th.messages.map(m =>
              m.id === messageId ? { ...m, hasLiked: !m.hasLiked } : m
            ),
          };
        }
        return th;
      })
    );
  };

  const createChatWithUser = (user: User): string => {
    const existing = chatThreads.find(th => th.participant.id === user.id);
    if (existing) {
      setActiveChatId(existing.id);
      setActiveTab('messages');
      return existing.id;
    }

    const newThread: ChatThread = {
      id: `chat_${Date.now()}`,
      participant: user,
      lastMessage: 'Started a new conversation',
      lastMessageTime: 'Now',
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: `m_init_${Date.now()}`,
          senderId: user.id,
          text: `Hey! Thanks for connecting 👋`,
          timestamp: 'Just now',
        },
      ],
    };

    setChatThreads(prev => [newThread, ...prev]);
    setActiveChatId(newThread.id);
    setActiveTab('messages');
    return newThread.id;
  };

  // Notifications
  const markNotificationRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const toggleFollowNotificationUser = (actorId: string) => {
    toggleFollowUser(actorId);
  };

  const triggerLiveActivity = (customType?: 'like' | 'follow' | 'comment') => {
    const creatorsPool = allCreators.length > 0 ? allCreators : INITIAL_USERS;
    const actor = creatorsPool[Math.floor(Math.random() * creatorsPool.length)];
    const myPost = allPosts.find(p => p.userId === currentUser.id) || allPosts[0];

    const type = customType || (Math.random() > 0.4 ? 'like' : Math.random() > 0.5 ? 'follow' : 'comment');
    const sampleComments = [
      'Incredible perspective on this! 🔥',
      'The vibe and tones are unmatched ✨',
      'Stunning composition 🙌',
      'Love everything about this shot! ❤️',
    ];

    const newNotif: NotificationItem = {
      id: `notif_act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      actor: {
        id: actor.id,
        username: actor.username,
        avatar: actor.avatar,
      },
      targetMediaUrl: type !== 'follow' ? myPost?.mediaUrl : undefined,
      text: type === 'comment' ? sampleComments[Math.floor(Math.random() * sampleComments.length)] : undefined,
      timestamp: 'Just now',
      isRead: false,
    };

    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
  };

  // Highlights
  const addHighlight = (title: string, coverUrl: string) => {
    const newHighlight: Highlight = {
      id: `h_${Date.now()}`,
      title,
      coverUrl,
      stories: [],
    };
    setHighlights(prev => [...prev, newHighlight]);
  };

  const unreadMessagesCount = chatThreads.reduce((acc, th) => acc + (th.unreadCount || 0), 0);
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <InstagramContext.Provider
      value={{
        currentUser,
        updateCurrentUser,
        allCreators,
        isFollowingUser,
        toggleFollowUser,
        followToast,
        dismissFollowToast,
        undoFollow,
        selectedUserIdForModal,
        openUserProfile,
        closeUserProfile,
        activePostIdForLikesModal,
        openPostLikesModal,
        closePostLikesModal,
        followListModal,
        openFollowersModal,
        openFollowingModal,
        closeFollowListModal,
        allPosts,
        homeFeedPosts,
        userPosts,
        savedPosts,
        savedPostIds,
        saveToast,
        dismissSaveToast,
        profileTab,
        setProfileTab,
        toggleLikePost,
        toggleLikeComment,
        toggleBookmarkPost,
        addCommentToPost,
        deletePost,
        createPost,
        allStoriesGroups,
        activeStoriesGroups,
        markStoriesSeen,
        addStory,
        deleteStory,
        isStoryCreatorOpen,
        setIsStoryCreatorOpen,
        viewingStoryUserId,
        setViewingStoryUserId,
        reels,
        toggleLikeReel,
        toggleBookmarkReel,
        toggleFollowReelUser,
        addCommentToReel,
        createReel,
        chatThreads,
        activeChatId,
        setActiveChatId,
        sendMessage,
        toggleMessageLike,
        createChatWithUser,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        toggleFollowNotificationUser,
        triggerLiveActivity,
        highlights,
        addHighlight,
        explorePosts: EXPLORE_POSTS,
        registerUser,
        loginUser,
        resetToZeroAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        selectedPostForDetail,
        setSelectedPostForDetail,
        isCreateModalOpen,
        setIsCreateModalOpen,
        shareModalData,
        setShareModalData,
        unreadMessagesCount,
        unreadNotificationsCount,
      }}
    >
      {children}
    </InstagramContext.Provider>
  );
};

export const useInstagram = () => {
  const context = useContext(InstagramContext);
  if (!context) {
    throw new Error('useInstagram must be used within an InstagramProvider');
  }
  return context;
};
