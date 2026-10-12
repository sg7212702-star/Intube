import React, { useState } from 'react';
import {
  X,
  BadgeCheck,
  UserCheck,
  UserPlus,
  MessageCircle,
  Grid,
  Film,
  Bookmark,
  Share2,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const UserProfileModal: React.FC = () => {
  const {
    selectedUserIdForModal,
    closeUserProfile,
    allCreators,
    currentUser,
    isFollowingUser,
    toggleFollowUser,
    allPosts,
    reels,
    setSelectedPostForDetail,
    createChatWithUser,
    openFollowersModal,
    openFollowingModal,
    setShareModalData,
    theme,
  } = useInstagram();

  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');

  if (!selectedUserIdForModal) return null;

  // Find user (could be a creator or current user)
  const isSelf = selectedUserIdForModal === currentUser.id;
  const user = isSelf
    ? currentUser
    : allCreators.find(c => c.id === selectedUserIdForModal) || {
        id: selectedUserIdForModal,
        username: 'creator',
        fullName: 'Creative Explorer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        followersCount: 1200,
        followingCount: 300,
        postsCount: 5,
        bio: 'Visual creator on InTube ✨',
      };

  const isFollowing = isFollowingUser(user.id);
  const userPosts = allPosts.filter(p => p.userId === user.id);
  const userReels = reels.filter(r => r.userId === user.id);

  // Live follower count reactive to follow/unfollow
  const displayFollowersCount = isSelf
    ? currentUser.followersCount
    : (user.followersCount || 0) + (isFollowing && !user.isFollowing ? 1 : !isFollowing && user.isFollowing ? -1 : 0);

  const handleShareProfile = () => {
    setShareModalData({
      title: `@${user.username} on InTube`,
      url: window.location.href,
      image: user.avatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-neutral-950 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">{user.username}</span>
            {user.isVerified && (
              <BadgeCheck size={16} className="text-sky-500 fill-sky-500" />
            )}
            {isFollowing && !isSelf && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Follows you
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800/50 transition-colors"
              title="Share profile"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={closeUserProfile}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800/50 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Profile Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* User Bio & Info Row */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-6 mb-5">
              {/* Avatar with Story gradient */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-center mb-3">
                  <div>
                    <span className="block font-bold text-base tabular-nums">
                      {userPosts.length || user.postsCount || 0}
                    </span>
                    <span className="text-[11px] text-neutral-400">posts</span>
                  </div>
                  <button
                    onClick={() => openFollowersModal(user as any)}
                    className="cursor-pointer group"
                  >
                    <span className="block font-bold text-base tabular-nums group-hover:text-rose-400 transition-colors">
                      {displayFollowersCount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-neutral-400 group-hover:underline">followers</span>
                  </button>
                  <button
                    onClick={() => openFollowingModal(user as any)}
                    className="cursor-pointer group"
                  >
                    <span className="block font-bold text-base tabular-nums group-hover:text-rose-400 transition-colors">
                      {(user.followingCount || 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-neutral-400 group-hover:underline">following</span>
                  </button>
                </div>

                {/* Follow & Message Buttons */}
                {!isSelf ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFollowUser(user.id)}
                      className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        isFollowing
                          ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 shadow-md'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={14} className="text-emerald-400" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        createChatWithUser(user as any);
                        closeUserProfile();
                      }}
                      className="py-1.5 px-4 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>Message</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400 py-1 bg-neutral-900/40 rounded-lg text-center border border-neutral-800">
                    This is your personal profile
                  </div>
                )}
              </div>
            </div>

            {/* Name & Bio */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">{user.fullName}</span>
              {user.bio && (
                <p className="whitespace-pre-line text-neutral-300 leading-relaxed">
                  {user.bio}
                </p>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline pt-0.5"
                >
                  <ExternalLink size={12} />
                  <span>{user.website.replace('https://', '')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Grid Tabs (Posts / Reels) */}
          <div className="flex border-t border-neutral-800/40">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-t-2 -mt-[1px] transition-colors ${
                activeTab === 'posts'
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Grid size={15} />
              <span>POSTS ({userPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-t-2 -mt-[1px] transition-colors ${
                activeTab === 'reels'
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Film size={15} />
              <span>REELS ({userReels.length})</span>
            </button>
          </div>

          {/* Content Grid */}
          <div className="p-2 sm:p-4">
            {activeTab === 'posts' ? (
              userPosts.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  No posts yet from this creator.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                  {userPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setSelectedPostForDetail(post);
                        closeUserProfile();
                      }}
                      className="group relative aspect-square bg-neutral-900 cursor-pointer overflow-hidden rounded-md"
                    >
                      <img
                        src={post.mediaUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="fill-white" />
                          <span>{post.likesCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} className="fill-white" />
                          <span>{post.commentsCount}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : userReels.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                No reels uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                {userReels.map(reel => (
                  <div
                    key={reel.id}
                    className="group relative aspect-[9/16] bg-neutral-900 cursor-pointer overflow-hidden rounded-md"
                  >
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                      <Heart size={14} className="fill-white" />
                      <span>{reel.likesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
