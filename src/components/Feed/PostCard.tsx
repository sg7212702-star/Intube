import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile,
  BadgeCheck,
  Share2,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  User as UserIcon,
} from 'lucide-react';
import { Post } from '../../types/instagram';
import { useInstagram } from '../../context/InstagramContext';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    toggleLikePost,
    toggleLikeComment,
    toggleBookmarkPost,
    savedPostIds,
    addCommentToPost,
    deletePost,
    setSelectedPostForDetail,
    setShareModalData,
    setViewingStoryUserId,
    allStoriesGroups,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    openPostLikesModal,
    theme,
  } = useInstagram();

  const isBookmarked = savedPostIds.includes(post.id) || post.isBookmarked;

  const [commentText, setCommentText] = useState('');
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showQuickEmojis, setShowQuickEmojis] = useState(false);

  // Check if post owner has an active story
  const ownerStories = allStoriesGroups.find(g => g.userId === post.userId);
  const hasStory = !!ownerStories;

  // Double tap to like
  const handleMediaDoubleTap = () => {
    setShowHeartAnimation(true);
    if (!post.hasLiked) {
      toggleLikePost(post.id);
    }
    setTimeout(() => {
      setShowHeartAnimation(false);
    }, 900);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToPost(post.id, commentText);
    setCommentText('');
    setShowQuickEmojis(false);
  };

  const handleShare = () => {
    setShareModalData({
      title: `Post by @${post.username}`,
      url: window.location.href,
      image: post.mediaUrl,
    });
  };

  const isOwnPost = post.userId === currentUser.id;

  return (
    <article
      className={`w-full max-w-xl mx-auto mb-6 border rounded-2xl overflow-hidden transition-colors ${
        theme === 'dark'
          ? 'bg-neutral-950 border-neutral-800/80 text-white'
          : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3.5 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar with optional story ring */}
          <div
            onClick={() => {
              if (hasStory) {
                setViewingStoryUserId(post.userId);
              }
            }}
            className={`cursor-pointer ${
              hasStory
                ? 'p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600'
                : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800">
              <img
                src={post.userAvatar}
                alt={post.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => openUserProfile(post.userId)}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {post.username}
              </span>
              {post.isVerified && (
                <BadgeCheck size={14} className="text-sky-500 fill-sky-500" />
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
              <span className="text-[11px] text-neutral-400 leading-tight">
                {post.location}
              </span>
            )}
          </div>
        </div>

        {/* Options button */}
        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu(prev => !prev)}
            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal size={20} />
          </button>

          {/* Options Dropdown */}
          {showOptionsMenu && (
            <div
              className={`absolute right-0 top-full mt-1 w-48 rounded-xl p-1.5 shadow-xl border z-20 backdrop-blur-md ${
                theme === 'dark'
                  ? 'bg-neutral-900/95 border-neutral-800 text-neutral-200'
                  : 'bg-white/95 border-neutral-200 text-neutral-800'
              }`}
            >
              <button
                onClick={() => {
                  openUserProfile(post.userId);
                  setShowOptionsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-neutral-500/10 text-left cursor-pointer"
              >
                <UserIcon size={14} />
                <span>View Profile</span>
              </button>

              {!isOwnPost && (
                <button
                  onClick={() => {
                    toggleFollowUser(post.userId);
                    setShowOptionsMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-neutral-500/10 text-left cursor-pointer ${
                    isFollowingUser(post.userId) ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isFollowingUser(post.userId) ? (
                    <>
                      <UserMinus size={14} />
                      <span>Unfollow @{post.username}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Follow @{post.username}</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  handleShare();
                  setShowOptionsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-neutral-500/10 text-left"
              >
                <Share2 size={14} />
                <span>Share to...</span>
              </button>
              <button
                onClick={() => {
                  toggleBookmarkPost(post.id);
                  setShowOptionsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-neutral-500/10 text-left cursor-pointer"
              >
                <Bookmark size={14} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
                <span>{isBookmarked ? 'Remove from Saved' : 'Save Post'}</span>
              </button>
              {isOwnPost && (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg text-left"
                >
                  <Trash2 size={14} />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Media with double-tap heart */}
      <div
        onDoubleClick={handleMediaDoubleTap}
        className="relative w-full aspect-square bg-neutral-900 select-none overflow-hidden cursor-pointer"
      >
        <img
          src={post.mediaUrl}
          alt={post.caption || 'Post media'}
          className={`w-full h-full object-cover ${post.filter ? `filter-${post.filter}` : ''}`}
          loading="lazy"
        />

        {/* Bouncing heart on double tap */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart
              size={100}
              className="text-white fill-white animate-heart-burst drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />
          </div>
        )}

        {/* Real-time Live Engagement Badge on Media */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold opacity-90 select-none">
          <span className="flex items-center gap-1">
            <Heart size={12} className={post.hasLiked ? "text-rose-500 fill-rose-500" : "text-white fill-white/80"} />
            <span className="tabular-nums">{post.likesCount.toLocaleString()}</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} className="text-white fill-white/80" />
            <span className="tabular-nums">{post.commentsCount.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Action Bar (Like, Comment, Share, Bookmark) with Live Counters */}
      <div className="px-3.5 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-4">
            {/* Heart button & Live Likes Counter */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleLikePost(post.id)}
                className="transition-transform active:scale-125"
                aria-label={post.hasLiked ? 'Unlike post' : 'Like post'}
              >
                <Heart
                  size={24}
                  className={
                    post.hasLiked
                      ? 'text-rose-500 fill-rose-500 transition-colors'
                      : 'hover:text-neutral-400 transition-colors'
                  }
                />
              </button>
              <span className="text-xs font-semibold tabular-nums text-neutral-300">
                {post.likesCount.toLocaleString()}
              </span>
            </div>

            {/* Comment button & Live Comments Counter */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedPostForDetail(post)}
                className="hover:text-neutral-400 transition-colors"
                aria-label="Comment"
              >
                <MessageCircle size={24} />
              </button>
              <span className="text-xs font-semibold tabular-nums text-neutral-300">
                {post.commentsCount.toLocaleString()}
              </span>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="hover:text-neutral-400 transition-colors"
              aria-label="Share post"
            >
              <Send size={22} />
            </button>
          </div>

          {/* Bookmark / Save */}
          <button
            onClick={() => toggleBookmarkPost(post.id)}
            className="transition-transform active:scale-125 cursor-pointer"
            aria-label={isBookmarked ? 'Unsave post' : 'Save post'}
            title={isBookmarked ? 'Remove from Saved' : 'Save post'}
          >
            <Bookmark
              size={24}
              className={
                isBookmarked
                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm transition-colors'
                  : 'hover:text-neutral-400 transition-colors'
              }
            />
          </button>
        </div>

        {/* Stacked Liker Avatars & Real-time Likes Counter */}
        <div className="mb-2 flex items-center justify-between">
          <div
            onClick={() => openPostLikesModal(post.id)}
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="View accounts who liked this post"
          >
            {post.likesCount > 0 && (
              <div className="flex -space-x-1.5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="liker"
                  className="w-4.5 h-4.5 rounded-full ring-1 ring-black object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="liker"
                  className="w-4.5 h-4.5 rounded-full ring-1 ring-black object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="liker"
                  className="w-4.5 h-4.5 rounded-full ring-1 ring-black object-cover"
                />
              </div>
            )}
            <span className="font-semibold text-xs tracking-tight text-neutral-200 group-hover:underline">
              {post.likesCount === 0
                ? '0 likes · Be first to like'
                : `Liked by rohit_photography and ${post.likesCount.toLocaleString()} others`}
            </span>
          </div>

          {/* Real-time pulse indicator */}
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </span>
        </div>

        {/* Caption */}
        <div className="text-sm mb-2 leading-relaxed">
          <span
            onClick={() => openUserProfile(post.userId)}
            className="font-semibold mr-2 hover:underline cursor-pointer"
          >
            {post.username}
          </span>
          <span>
            {isCaptionExpanded
              ? post.caption
              : post.caption.slice(0, 95)}
          </span>
          {post.caption.length > 95 && !isCaptionExpanded && (
            <button
              onClick={() => setIsCaptionExpanded(true)}
              className="text-neutral-400 hover:text-neutral-200 ml-1 text-xs"
            >
              ... more
            </button>
          )}
        </div>

        {/* Comments count / link */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => setSelectedPostForDetail(post)}
            className="text-xs text-neutral-400 hover:text-neutral-200 mb-2 flex items-center gap-1.5 font-medium transition-colors"
          >
            <MessageCircle size={13} />
            <span>View all {post.commentsCount.toLocaleString()} comments</span>
          </button>
        )}

        {/* Preview of latest comment */}
        {post.comments.length > 0 && (
          <div className="text-xs text-neutral-300 mb-2 flex items-center justify-between">
            <div>
              <span
                onClick={() => {
                  if (post.comments[0].userId) openUserProfile(post.comments[0].userId);
                }}
                className="font-semibold mr-1.5 hover:underline cursor-pointer"
              >
                {post.comments[0].username}
              </span>
              <span>{post.comments[0].text}</span>
            </div>
            <button
              onClick={() => toggleLikeComment(post.id, post.comments[0].id)}
              className="p-1 hover:scale-125 transition-transform"
              title="Like comment"
            >
              <Heart
                size={12}
                className={
                  post.comments[0].hasLiked
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-neutral-500 hover:text-rose-500'
                }
              />
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-[10px] uppercase text-neutral-500 tracking-wider mb-2">
          {post.timestamp}
        </div>
      </div>

      {/* Inline Quick Emojis Drawer */}
      {showQuickEmojis && (
        <div className="px-3.5 py-1.5 flex items-center justify-start gap-3 border-t border-neutral-800/40 text-lg">
          {['😍', '😂', '🔥', '❤️', '👏', '🙌', '✨'].map(emoji => (
            <button
              key={emoji}
              onClick={() => setCommentText(prev => prev + emoji)}
              className="hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Inline Add Comment Form */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center px-3.5 py-2.5 border-t border-neutral-800/40"
      >
        <button
          type="button"
          onClick={() => setShowQuickEmojis(prev => !prev)}
          className="p-1 text-neutral-400 hover:text-neutral-200 mr-2 transition-colors"
          title="Insert Emoji"
        >
          <Smile size={20} />
        </button>

        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-xs placeholder:text-neutral-500 focus:outline-none"
        />

        {commentText.trim() && (
          <button
            type="submit"
            className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors ml-2"
          >
            Post
          </button>
        )}
      </form>
    </article>
  );
};
