import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile,
  BadgeCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const PostDetailModal: React.FC = () => {
  const {
    currentUser,
    selectedPostForDetail,
    setSelectedPostForDetail,
    toggleLikePost,
    toggleLikeComment,
    toggleBookmarkPost,
    savedPostIds,
    addCommentToPost,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    openPostLikesModal,
    setShareModalData,
    theme,
  } = useInstagram();

  const [commentText, setCommentText] = useState('');
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPostForDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!selectedPostForDetail) return null;

  const post = selectedPostForDetail;
  const isBookmarked = savedPostIds.includes(post.id) || post.isBookmarked;

  const handleMediaDoubleTap = () => {
    setDoubleTapHeart(true);
    if (!post.hasLiked) {
      toggleLikePost(post.id);
    }
    setTimeout(() => setDoubleTapHeart(false), 900);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToPost(post.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    setShareModalData({
      title: `Post by @${post.username}`,
      url: window.location.href,
      image: post.mediaUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 md:p-6 select-none">
      {/* Close button */}
      <button
        onClick={() => setSelectedPostForDetail(null)}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 z-50"
      >
        <X size={26} />
      </button>

      {/* Main Container */}
      <div
        className={`w-full max-w-4xl h-[90vh] max-h-[750px] rounded-2xl overflow-hidden border shadow-2xl flex flex-col md:flex-row ${
          theme === 'dark'
            ? 'bg-neutral-950 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Left Side: Media */}
        <div
          onDoubleClick={handleMediaDoubleTap}
          className="relative w-full md:w-[58%] h-1/2 md:h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className={`w-full h-full object-cover ${post.filter ? `filter-${post.filter}` : ''}`}
          />

          {doubleTapHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Heart
                size={90}
                className="text-white fill-white animate-heart-burst drop-shadow-xl"
              />
            </div>
          )}
        </div>

        {/* Right Side: Comments and Details */}
        <div className="w-full md:w-[42%] h-1/2 md:h-full flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-800/60">
          {/* Header */}
          <header className="p-3.5 border-b border-neutral-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                onClick={() => openUserProfile(post.userId)}
                src={post.userAvatar}
                alt={post.username}
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-90"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => openUserProfile(post.userId)}
                    className="font-semibold text-xs hover:underline cursor-pointer"
                  >
                    {post.username}
                  </span>
                  {post.isVerified && (
                    <BadgeCheck size={13} className="text-sky-500 fill-sky-500" />
                  )}
                  {post.userId !== currentUser.id && (
                    <>
                      <span className="text-neutral-500 text-xs">·</span>
                      <button
                        onClick={() => toggleFollowUser(post.userId)}
                        className={`text-xs font-semibold transition-all flex items-center gap-1 ${
                          isFollowingUser(post.userId)
                            ? 'text-neutral-400 hover:text-rose-400'
                            : 'text-rose-500 hover:text-rose-400'
                        }`}
                      >
                        {isFollowingUser(post.userId) ? (
                          <>
                            <UserCheck size={11} className="text-emerald-400" />
                            <span>Following</span>
                          </>
                        ) : (
                          'Follow'
                        )}
                      </button>
                    </>
                  )}
                </div>
                {post.location && (
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    {post.location}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => openUserProfile(post.userId)}
              className="text-neutral-400 hover:text-white p-1 text-xs font-semibold"
            >
              Profile
            </button>
          </header>

          {/* Comments and Caption Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
            {/* Caption as primary item */}
            <div className="flex items-start gap-3">
              <img
                onClick={() => openUserProfile(post.userId)}
                src={post.userAvatar}
                alt={post.username}
                className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <span
                  onClick={() => openUserProfile(post.userId)}
                  className="font-bold mr-1.5 hover:underline cursor-pointer"
                >
                  {post.username}
                </span>
                <span className="leading-relaxed text-neutral-200">{post.caption}</span>
                <div className="text-[10px] text-neutral-500 mt-1">{post.timestamp}</div>
              </div>
            </div>

            {/* List of comments */}
            {post.comments.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">
                No comments yet. Start the conversation!
              </div>
            ) : (
              post.comments.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  <img
                    onClick={() => {
                      if (c.userId) openUserProfile(c.userId);
                    }}
                    src={c.userAvatar}
                    alt={c.username}
                    className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span
                      onClick={() => {
                        if (c.userId) openUserProfile(c.userId);
                      }}
                      className="font-bold mr-1.5 hover:underline cursor-pointer"
                    >
                      {c.username}
                    </span>
                    <span className="text-neutral-200">{c.text}</span>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-1">
                      <span>{c.timestamp}</span>
                      {(c.likesCount || 0) > 0 && (
                        <span className="font-semibold text-neutral-400">
                          {c.likesCount} {c.likesCount === 1 ? 'like' : 'likes'}
                        </span>
                      )}
                      <button
                        onClick={() => setCommentText(`@${c.username} `)}
                        className="font-semibold hover:text-neutral-300"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLikeComment(post.id, c.id)}
                    className="p-1 hover:scale-125 transition-transform"
                    title="Like comment"
                  >
                    <Heart
                      size={12}
                      className={
                        c.hasLiked
                          ? 'text-rose-500 fill-rose-500'
                          : 'text-neutral-500 hover:text-rose-500'
                      }
                    />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Actions & Like Count */}
          <div className="p-3.5 border-t border-neutral-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className="transition-transform active:scale-125"
                  >
                    <Heart
                      size={22}
                      className={post.hasLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-neutral-400'}
                    />
                  </button>
                  <span
                    onClick={() => openPostLikesModal(post.id)}
                    className="text-xs font-semibold tabular-nums text-neutral-300 cursor-pointer hover:underline"
                  >
                    {post.likesCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button className="hover:text-neutral-400">
                    <MessageCircle size={22} />
                  </button>
                  <span className="text-xs font-semibold tabular-nums text-neutral-300">
                    {post.commentsCount.toLocaleString()}
                  </span>
                </div>

                <button onClick={handleShare} className="hover:text-neutral-400">
                  <Send size={20} />
                </button>
              </div>

              <button
                onClick={() => toggleBookmarkPost(post.id)}
                className="transition-transform active:scale-125 cursor-pointer"
                title={isBookmarked ? 'Remove from Saved' : 'Save post'}
                aria-label={isBookmarked ? 'Remove from Saved' : 'Save post'}
              >
                <Bookmark
                  size={22}
                  className={
                    isBookmarked
                      ? 'text-amber-400 fill-amber-400 drop-shadow-sm transition-colors'
                      : 'hover:text-neutral-400 transition-colors'
                  }
                />
              </button>
            </div>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => openPostLikesModal(post.id)}
                  className="font-semibold text-xs tracking-tight cursor-pointer hover:underline text-neutral-200"
                >
                  {post.likesCount.toLocaleString()} likes
                </span>
                <span className="text-neutral-500 text-xs">·</span>
                <span className="text-xs text-neutral-400">
                  {post.commentsCount.toLocaleString()} comments
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live</span>
              </span>
            </div>
            <div className="text-[10px] uppercase text-neutral-500 tracking-wider">
              {post.timestamp}
            </div>
          </div>

          {/* Comment input form */}
          <form onSubmit={handleCommentSubmit} className="p-3 border-t border-neutral-800/40 flex items-center gap-2">
            <Smile size={18} className="text-neutral-400 mr-1" />
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-neutral-500"
            />
            {commentText.trim() && (
              <button
                type="submit"
                className="text-xs font-bold text-rose-500 hover:text-rose-400"
              >
                Post
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
