import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Check,
  Zap,
  Activity,
  Sparkles,
  Radio,
  UserCheck,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';
import { NotificationItem, Post } from '../../types/instagram';

export const NotificationsDrawer: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    toggleFollowNotificationUser,
    isFollowingUser,
    openUserProfile,
    triggerLiveActivity,
    allPosts,
    setSelectedPostForDetail,
    theme,
  } = useInstagram();

  const [activeFilter, setActiveFilter] = useState<'activity' | 'all' | 'like' | 'comment' | 'follow'>('activity');
  const [activityCategory, setActivityCategory] = useState<'all' | 'follows' | 'likes' | 'comments'>('all');

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'activity') {
      if (activityCategory === 'all') return true;
      if (activityCategory === 'follows') return item.type === 'follow';
      if (activityCategory === 'likes') return item.type === 'like';
      if (activityCategory === 'comments') return item.type === 'comment';
      return true;
    }
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={14} className="text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle size={14} className="text-sky-400 fill-sky-400" />;
      case 'follow':
        return <UserPlus size={14} className="text-indigo-400" />;
      case 'mention':
        return <AtSign size={14} className="text-emerald-400" />;
    }
  };

  const handleOpenMedia = (mediaUrl?: string) => {
    if (!mediaUrl) return;
    const targetPost = allPosts.find(p => p.mediaUrl === mediaUrl) || {
      id: `post_preview_${Date.now()}`,
      userId: 'user_preview',
      username: 'creator',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      mediaUrl,
      mediaType: 'image' as const,
      caption: 'Visual story post on InTube ✨',
      likesCount: 38,
      hasLiked: false,
      isBookmarked: false,
      commentsCount: 4,
      comments: [],
      timestamp: 'Recently',
    };
    setSelectedPostForDetail(targetPost as Post);
  };

  // Grouping helper for the Activity Feed
  const getTimeGroup = (timestamp: string): 'Live & Recent' | 'Today' | 'This Week' | 'Earlier' => {
    const t = timestamp.toLowerCase();
    if (t.includes('just now') || t.includes('now') || t.includes('1m') || t.includes('2m') || t.includes('3m') || t.includes('5m')) {
      return 'Live & Recent';
    }
    if (t.includes('m ago') || t.includes('h ago') || t.includes('today') || t.includes('15m') || t.includes('1h') || t.includes('3h')) {
      return 'Today';
    }
    if (t.includes('1d') || t.includes('2d') || t.includes('3d') || t.includes('week') || t.includes('yesterday')) {
      return 'This Week';
    }
    return 'Earlier';
  };

  // Group notifications for the Activity view
  const activityGroups: { title: string; items: NotificationItem[] }[] = [
    {
      title: 'Live & Recent',
      items: filteredNotifications.filter(n => getTimeGroup(n.timestamp) === 'Live & Recent'),
    },
    {
      title: 'Today',
      items: filteredNotifications.filter(n => getTimeGroup(n.timestamp) === 'Today'),
    },
    {
      title: 'This Week',
      items: filteredNotifications.filter(n => getTimeGroup(n.timestamp) === 'This Week'),
    },
    {
      title: 'Earlier',
      items: filteredNotifications.filter(n => getTimeGroup(n.timestamp) === 'Earlier'),
    },
  ].filter(group => group.items.length > 0);

  return (
    <div className="w-full max-w-xl mx-auto px-3 py-4 mb-16 md:mb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>Notifications</span>
            {activeFilter === 'activity' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Activity
              </span>
            )}
          </h2>
          <span className="text-xs text-neutral-400">
            Real-time interactions, follows, likes, and comments
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeFilter === 'activity' && (
            <button
              onClick={() => triggerLiveActivity()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
              title="Simulate a new real-time engagement interaction"
            >
              <Zap size={13} className="fill-white" />
              <span>Simulate</span>
            </button>
          )}

          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg hover:bg-neutral-800/50"
            title="Mark all notifications as read"
          >
            <Check size={14} />
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'activity', label: 'Activity', icon: Activity, isLive: true },
          { id: 'all', label: 'All', icon: null },
          { id: 'like', label: 'Likes', icon: Heart },
          { id: 'comment', label: 'Comments', icon: MessageCircle },
          { id: 'follow', label: 'Follows', icon: UserPlus },
        ].map(filter => {
          const isActive = activeFilter === filter.id;
          const IconComponent = filter.icon;

          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                isActive
                  ? filter.id === 'activity'
                    ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-md shadow-rose-500/20 font-bold'
                    : 'bg-rose-500 text-white shadow-sm'
                  : theme === 'dark'
                  ? 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800/80'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {filter.isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
              {IconComponent && <IconComponent size={13} />}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activity Sub-Filter Pills (Shown when Activity tab is selected) */}
      {activeFilter === 'activity' && (
        <div className="mb-4 p-3 rounded-2xl border bg-gradient-to-b from-neutral-900/60 to-neutral-950/80 border-neutral-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Real-Time Interaction Feed</span>
            </div>
            <span className="text-[10px] text-neutral-400">
              Auto-updating live stream
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'follows', label: 'New Follows' },
              { id: 'likes', label: 'Likes & Hearts' },
              { id: 'comments', label: 'Comments' },
            ].map(sub => {
              const isSelected = activityCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActivityCategory(sub.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 text-white font-semibold border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interaction Feed Stream */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-800">
            <Activity size={24} />
          </div>
          <div>
            <span className="font-semibold block text-neutral-300">No activity yet in this filter</span>
            <span className="text-xs text-neutral-500 mt-0.5 block">
              When users like your posts, comment, or follow you, interactions appear here in real-time.
            </span>
          </div>
          {activeFilter === 'activity' && (
            <button
              onClick={() => triggerLiveActivity()}
              className="mt-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap size={13} className="text-amber-400" />
              <span>Generate Test Interaction</span>
            </button>
          )}
        </div>
      ) : activeFilter === 'activity' ? (
        /* Real-Time Activity Grouped Sections */
        <div className="space-y-5">
          {activityGroups.map(group => (
            <div key={group.title} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {group.title}
                </span>
                {group.title === 'Live & Recent' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <div className="flex-1 h-[1px] bg-neutral-800/60 ml-1" />
              </div>

              <div className="space-y-2">
                {group.items.map(item => {
                  const isFollowing = isFollowingUser(item.actor.id);
                  const isLiveRecent = getTimeGroup(item.timestamp) === 'Live & Recent';

                  return (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isLiveRecent
                          ? theme === 'dark'
                            ? 'bg-neutral-900/95 border-neutral-700/80 shadow-md shadow-rose-500/5'
                            : 'bg-white border-rose-200 shadow-sm'
                          : !item.isRead
                          ? theme === 'dark'
                            ? 'bg-neutral-900/80 border-neutral-800'
                            : 'bg-rose-50/70 border-rose-200'
                          : theme === 'dark'
                          ? 'bg-neutral-950/80 border-neutral-900 hover:border-neutral-800'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Left Side: Avatar with icon badge & Activity Statement */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            openUserProfile(item.actor.id);
                          }}
                          className="relative cursor-pointer group flex-shrink-0"
                          title={`View @${item.actor.username}'s profile`}
                        >
                          <img
                            src={item.actor.avatar}
                            alt={item.actor.username}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-800 group-hover:ring-rose-500 transition-all"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black flex items-center justify-center border border-neutral-700 shadow-sm">
                            {getIcon(item.type)}
                          </div>
                        </div>

                        {/* Statement */}
                        <div className="text-xs min-w-0 flex-1">
                          <p className="leading-snug break-words">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                openUserProfile(item.actor.id);
                              }}
                              className="font-bold mr-1 hover:underline cursor-pointer text-white"
                            >
                              {item.actor.username}
                            </span>
                            {item.type === 'like' && (
                              <span className="text-neutral-300">
                                liked your post.
                              </span>
                            )}
                            {item.type === 'comment' && (
                              <span className="text-neutral-300">
                                commented: <span className="text-white italic font-normal">"{item.text || 'Awesome photo!'}"</span>
                              </span>
                            )}
                            {item.type === 'follow' && (
                              <span className="text-neutral-300">
                                started following you.
                              </span>
                            )}
                            {item.type === 'mention' && (
                              <span className="text-neutral-300">
                                {item.text || 'mentioned you in a post.'}
                              </span>
                            )}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-neutral-400 font-medium">
                              {item.timestamp}
                            </span>
                            {isLiveRecent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Just now
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Media thumbnail or Follow button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.type === 'follow' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollowNotificationUser(item.actor.id);
                            }}
                            className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                              isFollowing
                                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20 font-bold'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck size={12} className="text-emerald-400" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus size={12} />
                                <span>Follow Back</span>
                              </>
                            )}
                          </button>
                        ) : item.targetMediaUrl ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMedia(item.targetMediaUrl);
                            }}
                            className="relative group cursor-pointer"
                            title="View post"
                          >
                            <img
                              src={item.targetMediaUrl}
                              alt="target post"
                              className="w-11 h-11 rounded-xl object-cover border border-neutral-800 group-hover:opacity-85 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center text-white">
                              <ArrowUpRight size={14} />
                            </div>
                          </div>
                        ) : null}

                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Filtered Notification Items */
        <div className="space-y-3">
          {filteredNotifications.map(item => {
            const isFollowing = isFollowingUser(item.actor.id);

            return (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !item.isRead
                    ? theme === 'dark'
                      ? 'bg-neutral-900/90 border-neutral-700'
                      : 'bg-rose-50/70 border-rose-200'
                    : theme === 'dark'
                    ? 'bg-neutral-950 border-neutral-900 hover:border-neutral-800'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openUserProfile(item.actor.id);
                    }}
                    className="relative cursor-pointer hover:opacity-90 flex-shrink-0"
                  >
                    <img
                      src={item.actor.avatar}
                      alt={item.actor.username}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/90 flex items-center justify-center border border-neutral-700">
                      {getIcon(item.type)}
                    </div>
                  </div>

                  <div className="text-xs min-w-0 flex-1">
                    <p className="leading-snug break-words">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openUserProfile(item.actor.id);
                        }}
                        className="font-bold mr-1 hover:underline cursor-pointer"
                      >
                        {item.actor.username}
                      </span>
                      {item.type === 'like' && 'liked your photo.'}
                      {item.type === 'comment' && `commented: "${item.text}"`}
                      {item.type === 'follow' && 'started following you.'}
                      {item.type === 'mention' && item.text}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-0.5 inline-block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {/* Right Action: Media thumbnail or Follow button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.type === 'follow' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollowNotificationUser(item.actor.id);
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all active:scale-95 cursor-pointer ${
                        isFollowing
                          ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                          : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow Back'}
                    </button>
                  ) : item.targetMediaUrl ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMedia(item.targetMediaUrl);
                      }}
                      className="cursor-pointer"
                    >
                      <img
                        src={item.targetMediaUrl}
                        alt="target post"
                        className="w-10 h-10 rounded-md object-cover border border-neutral-800 hover:opacity-80 transition-opacity"
                      />
                    </div>
                  ) : null}

                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
