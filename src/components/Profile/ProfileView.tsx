import React, { useState } from 'react';
import {
  Grid,
  Film,
  Bookmark,
  UserCheck,
  Settings,
  Plus,
  BadgeCheck,
  Heart,
  MessageCircle,
  Link as LinkIcon,
  X,
  Camera,
  Lock,
  Compass,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';
import { Highlight, Post } from '../../types/instagram';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    allPosts,
    userPosts,
    savedPosts,
    savedPostIds,
    toggleBookmarkPost,
    reels,
    highlights,
    addHighlight,
    setSelectedPostForDetail,
    setIsAuthModalOpen,
    setIsCreateModalOpen,
    setActiveTab: setGlobalActiveTab,
    profileTab,
    setProfileTab,
    openFollowersModal,
    openFollowingModal,
    theme,
  } = useInstagram();

  const [isCopied, setIsCopied] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNewHighlightOpen, setIsNewHighlightOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    fullName: currentUser.fullName,
    username: currentUser.username,
    bio: currentUser.bio || '',
    website: currentUser.website || '',
    avatar: currentUser.avatar,
  });

  // New highlight form state
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightCover, setNewHighlightCover] = useState('');

  // Saved category filter
  const [savedCategory, setSavedCategory] = useState<'all' | 'photos' | 'videos'>('all');
  // User reels
  const userReels = reels.filter(r => r.userId === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser(editForm);
    setIsEditProfileOpen(false);
  };

  const handleCreateHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlightTitle.trim()) return;
    const cover = newHighlightCover.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80';
    addHighlight(newHighlightTitle.trim(), cover);
    setNewHighlightTitle('');
    setNewHighlightCover('');
    setIsNewHighlightOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 md:px-6 py-6 mb-16 md:mb-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 pb-8 border-b border-neutral-800/40">
        {/* Avatar */}
        <div className="relative group mx-auto md:mx-0">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600">
            <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="absolute bottom-1 right-1 p-2 rounded-full bg-rose-500 text-white shadow-lg hover:scale-110 transition-transform"
            title="Change Avatar"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* User Details */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {/* Row 1: Username & Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{currentUser.username}</h1>
            {currentUser.isVerified && (
              <BadgeCheck size={20} className="text-sky-500 fill-sky-500" />
            )}

            <div className="flex items-center gap-2 ml-auto md:ml-2">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white'
                    : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-black'
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white'
                    : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-black'
                }`}
              >
                {isCopied ? 'Link Copied!' : 'Share Profile'}
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  theme === 'dark'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                }`}
              >
                Switch / New
              </button>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="p-1.5 text-neutral-400 hover:text-white"
                title="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Row 2: Stats (posts, followers, following) */}
          <div className="flex items-center gap-8 text-sm">
            <div>
              <span className="font-bold mr-1">{userPosts.length}</span>
              <span className="text-neutral-400">posts</span>
            </div>
            <button
              onClick={() => openFollowersModal(currentUser)}
              className="text-left group cursor-pointer"
            >
              <span className="font-bold mr-1 group-hover:text-rose-400 transition-colors">
                {currentUser.followersCount.toLocaleString()}
              </span>
              <span className="text-neutral-400 group-hover:underline">followers</span>
            </button>
            <button
              onClick={() => openFollowingModal(currentUser)}
              className="text-left group cursor-pointer"
            >
              <span className="font-bold mr-1 group-hover:text-rose-400 transition-colors">
                {currentUser.followingCount.toLocaleString()}
              </span>
              <span className="text-neutral-400 group-hover:underline">following</span>
            </button>
          </div>

          {/* Row 3: Full Name, Bio, and Website */}
          <div className="text-sm space-y-1">
            <div className="font-bold">{currentUser.fullName}</div>
            <p className="whitespace-pre-line text-neutral-300 leading-relaxed text-xs md:text-sm">
              {currentUser.bio}
            </p>
            {currentUser.website && (
              <a
                href={currentUser.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:underline pt-0.5"
              >
                <LinkIcon size={12} />
                <span>{currentUser.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Story Highlights Bar */}
      <div className="py-6 border-b border-neutral-800/40">
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-2">
          {/* Existing Highlights */}
          {highlights.map(h => (
            <div
              key={h.id}
              onClick={() => setSelectedHighlight(h)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-full p-[2px] border border-neutral-700 group-hover:border-rose-500 transition-colors">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                  <img
                    src={h.coverUrl}
                    alt={h.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
              <span className="text-xs text-neutral-300 truncate max-w-[70px]">
                {h.title}
              </span>
            </div>
          ))}

          {/* "+ New" Highlight button */}
          <div
            onClick={() => setIsNewHighlightOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 md:w-18 md:h-18 rounded-full border border-dashed border-neutral-600 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-white transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-white">New</span>
          </div>
        </div>
      </div>

      {/* Profile Tabs Navigation */}
      <div className="flex items-center justify-center gap-8 md:gap-14 border-b border-neutral-800/40 text-xs font-semibold uppercase tracking-wider mb-4">
        <button
          onClick={() => setProfileTab('posts')}
          className={`flex items-center gap-2 py-3 border-t-2 -mt-[1px] transition-colors cursor-pointer ${
            profileTab === 'posts'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Grid size={16} />
          <span>Posts</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-normal">
            {userPosts.length}
          </span>
        </button>

        <button
          onClick={() => setProfileTab('reels')}
          className={`flex items-center gap-2 py-3 border-t-2 -mt-[1px] transition-colors cursor-pointer ${
            profileTab === 'reels'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Film size={16} />
          <span>Reels</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-normal">
            {userReels.length}
          </span>
        </button>

        <button
          onClick={() => setProfileTab('saved')}
          className={`flex items-center gap-2 py-3 border-t-2 -mt-[1px] transition-colors cursor-pointer ${
            profileTab === 'saved'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bookmark size={16} className={profileTab === 'saved' ? 'fill-white text-white' : ''} />
          <span>Saved</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-normal ${
            profileTab === 'saved'
              ? 'bg-rose-500 text-white'
              : 'bg-neutral-800 text-neutral-400'
          }`}>
            {savedPosts.length}
          </span>
        </button>

        <button
          onClick={() => setProfileTab('tagged')}
          className={`flex items-center gap-2 py-3 border-t-2 -mt-[1px] transition-colors cursor-pointer ${
            profileTab === 'tagged'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <UserCheck size={16} />
          <span>Tagged</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {profileTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 text-sm">
              <Camera size={44} className="mx-auto mb-2 text-neutral-600" />
              <p className="font-semibold text-white">No Posts Yet</p>
              <p className="text-xs text-neutral-500 mt-1 mb-4">When you share photos, they will appear on your profile.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Share your first photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {userPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostForDetail(post)}
                  className="relative group aspect-square bg-neutral-900 cursor-pointer overflow-hidden rounded-md"
                >
                  <img
                    src={post.mediaUrl}
                    alt={post.caption}
                    className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                      post.filter ? `filter-${post.filter}` : ''
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold text-sm">
                    <div className="flex items-center gap-1.5">
                      <Heart size={18} className="fill-white" />
                      <span>{post.likesCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle size={18} className="fill-white" />
                      <span>{post.commentsCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Dedicated Saved Section */}
        {profileTab === 'saved' && (
          <div>
            {/* Saved Section Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">Saved Posts</h2>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[11px] font-semibold text-neutral-300">
                    {savedPosts.length}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <Lock size={12} className="text-neutral-400" />
                  <span>Only you can see what you've saved</span>
                </p>
              </div>

              {/* Category Pills (All, Photos, Videos) */}
              {savedPosts.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setSavedCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      savedCategory === 'all'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    All ({savedPosts.length})
                  </button>
                  <button
                    onClick={() => setSavedCategory('photos')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      savedCategory === 'photos'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    Photos ({savedPosts.filter(p => p.mediaType !== 'video').length})
                  </button>
                  <button
                    onClick={() => setSavedCategory('videos')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      savedCategory === 'videos'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    Videos ({savedPosts.filter(p => p.mediaType === 'video').length})
                  </button>
                </div>
              )}
            </div>

            {/* Saved Content Grid or Empty State */}
            {savedPosts.length === 0 ? (
              <div className="text-center py-16 px-4 max-w-md mx-auto text-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-neutral-700/80 bg-neutral-900/60 flex items-center justify-center text-neutral-400">
                  <Bookmark size={36} strokeWidth={1.5} className="text-amber-400/90" />
                </div>
                <h3 className="font-bold text-base text-white">Save photos and videos</h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved in this dedicated section.
                </p>
                <button
                  onClick={() => setGlobalActiveTab('explore')}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Compass size={16} />
                  <span>Explore Posts to Save</span>
                </button>
              </div>
            ) : (() => {
              const displayList = savedPosts.filter(p => {
                if (savedCategory === 'photos') return p.mediaType !== 'video';
                if (savedCategory === 'videos') return p.mediaType === 'video';
                return true;
              });

              if (displayList.length === 0) {
                return (
                  <div className="text-center py-14 text-neutral-400 text-xs">
                    <p>No saved {savedCategory} found in your collection.</p>
                    <button
                      onClick={() => setSavedCategory('all')}
                      className="mt-2 text-rose-400 hover:underline font-semibold cursor-pointer"
                    >
                      Show all saved posts
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {displayList.map(post => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostForDetail(post)}
                      className="relative group aspect-square bg-neutral-900 cursor-pointer overflow-hidden rounded-md"
                    >
                      <img
                        src={post.mediaUrl}
                        alt={post.caption}
                        className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                          post.filter ? `filter-${post.filter}` : ''
                        }`}
                        loading="lazy"
                      />

                      {/* Video indicator badge */}
                      {post.mediaType === 'video' && (
                        <div className="absolute top-2 left-2 text-white drop-shadow-md z-10">
                          <Film size={16} />
                        </div>
                      )}

                      {/* Quick 1-click Unsave button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmarkPost(post.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-500/90 text-white transition-all z-10 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                        title="Remove from Saved"
                        aria-label="Remove from Saved"
                      >
                        <Bookmark size={14} className="fill-amber-400 text-amber-400" />
                      </button>

                      {/* Hover overlay with engagement stats */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold text-sm">
                        <div className="flex items-center gap-1.5">
                          <Heart size={18} className="fill-white" />
                          <span>{post.likesCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={18} className="fill-white" />
                          <span>{post.commentsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {profileTab === 'reels' && (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {reels.map(reel => (
              <div
                key={reel.id}
                className="relative group aspect-[9/16] bg-neutral-900 cursor-pointer overflow-hidden rounded-md"
              >
                <video
                  src={reel.videoUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 text-white">
                  <Film size={16} />
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs font-semibold flex items-center gap-1">
                  <Heart size={12} className="fill-white" />
                  <span>{reel.likesCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {profileTab === 'tagged' && (
          <div className="text-center py-20 text-neutral-400 text-sm">
            <UserCheck size={44} className="mx-auto mb-2 text-neutral-600" />
            <p className="font-semibold text-white">Photos of you</p>
            <p className="text-xs text-neutral-500 mt-1">When people tag you in photos, they'll appear here.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${
              theme === 'dark'
                ? 'bg-neutral-900 border-neutral-800 text-white'
                : 'bg-white border-neutral-200 text-black'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <h3 className="font-bold text-lg">Edit Profile</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={e => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Website</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={e => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-semibold bg-rose-500 text-white hover:bg-rose-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Highlight Modal */}
      {isNewHighlightOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl p-5 border border-neutral-800 bg-neutral-900 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-bold text-sm">New Story Highlight</h3>
              <button onClick={() => setIsNewHighlightOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHighlight} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Highlight Name</label>
                <input
                  type="text"
                  value={newHighlightTitle}
                  onChange={e => setNewHighlightTitle(e.target.value)}
                  placeholder="e.g. Goa 🏖️, Memories 📸"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Cover Image URL (optional)</label>
                <input
                  type="text"
                  value={newHighlightCover}
                  onChange={e => setNewHighlightCover(e.target.value)}
                  placeholder="Paste image link or leave blank for preset"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewHighlightOpen(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHighlightTitle.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Highlight Viewer Dialog */}
      {selectedHighlight && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[360px] h-[640px] bg-neutral-900 rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
              <span className="font-bold text-white text-sm">{selectedHighlight.title}</span>
              <button onClick={() => setSelectedHighlight(null)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <img
              src={selectedHighlight.coverUrl}
              alt={selectedHighlight.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="p-4 z-10 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
              Highlight: {selectedHighlight.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
