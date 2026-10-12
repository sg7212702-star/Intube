import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music2,
  ChevronUp,
  ChevronDown,
  BadgeCheck,
  X,
  Share2,
} from 'lucide-react';
import { Reel } from '../../types/instagram';
import { useInstagram } from '../../context/InstagramContext';

export const ReelsView: React.FC = () => {
  const {
    reels,
    toggleLikeReel,
    toggleBookmarkReel,
    toggleFollowReelUser,
    addCommentToReel,
    isFollowingUser,
    openUserProfile,
    setShareModalData,
    theme,
  } = useInstagram();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentReel = reels[currentIndex] || reels[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleShare = () => {
    if (!currentReel) return;
    setShareModalData({
      title: `Reel by @${currentReel.username}`,
      url: window.location.href,
      image: currentReel.audioTrack.coverUrl || currentReel.userAvatar,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentReel) return;
    addCommentToReel(currentReel.id, commentText);
    setCommentText('');
  };

  // Keyboard navigation for reels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        handleNextReel();
      } else if (e.key === 'ArrowUp') {
        handlePrevReel();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isMuted]);

  if (!currentReel) return null;

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] md:h-screen flex items-center justify-center p-2 md:p-6 overflow-hidden select-none">
      {/* Vertical Navigation Buttons */}
      <div className="hidden lg:flex flex-col gap-3 absolute right-12 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={handlePrevReel}
          className="w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105"
          title="Previous reel (Up arrow)"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={handleNextReel}
          className="w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105"
          title="Next reel (Down arrow)"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Reel Phone Container (9:16 aspect ratio) */}
      <div className="relative w-full max-w-[390px] h-full max-h-[760px] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-neutral-800">
        {/* Video Player */}
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Center Play/Pause indicator icon when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
              <Play size={32} className="ml-1" />
            </div>
          </div>
        )}

        {/* Sound toggle button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Creator Info and Caption at bottom */}
        <div className="absolute bottom-4 left-4 right-16 z-20 text-white flex flex-col gap-2.5">
          {/* Creator profile */}
          <div className="flex items-center gap-2.5">
            <img
              onClick={() => openUserProfile(currentReel.userId)}
              src={currentReel.userAvatar}
              alt={currentReel.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50 cursor-pointer hover:opacity-90"
            />
            <div
              onClick={() => openUserProfile(currentReel.userId)}
              className="flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <span className="font-semibold text-sm drop-shadow">{currentReel.username}</span>
              {currentReel.isVerified && (
                <BadgeCheck size={14} className="text-sky-400 fill-sky-400" />
              )}
            </div>
            <button
              onClick={() => toggleFollowReelUser(currentReel.userId)}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all active:scale-95 cursor-pointer ${
                isFollowingUser(currentReel.userId)
                  ? 'bg-white/20 text-white backdrop-blur-md'
                  : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/30'
              }`}
            >
              {isFollowingUser(currentReel.userId) ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Reel Caption */}
          <p className="text-xs text-white/95 line-clamp-2 leading-relaxed drop-shadow-md">
            {currentReel.caption}
          </p>

          {/* Music track ticker */}
          <div className="flex items-center gap-2 text-xs text-white/80 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full w-max max-w-full">
            <Music2 size={13} className="animate-spin text-rose-400" />
            <span className="truncate max-w-[180px]">
              {currentReel.audioTrack.title} · {currentReel.audioTrack.artist}
            </span>
          </div>
        </div>

        {/* Right Action Bar (Heart, Comment, Share, Bookmark, Audio Disc) */}
        <div className="absolute bottom-4 right-3 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => toggleLikeReel(currentReel.id)}
              className="p-2 transition-transform active:scale-130"
              aria-label="Like reel"
            >
              <Heart
                size={28}
                className={
                  currentReel.hasLiked
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-white hover:text-white/80'
                }
              />
            </button>
            <span className="text-[11px] font-semibold drop-shadow">
              {currentReel.likesCount > 1000
                ? `${(currentReel.likesCount / 1000).toFixed(1)}k`
                : currentReel.likesCount}
            </span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="p-2 transition-transform active:scale-110 text-white hover:text-white/80"
              aria-label="Open comments"
            >
              <MessageCircle size={26} />
            </button>
            <span className="text-[11px] font-semibold drop-shadow">
              {currentReel.commentsCount}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 transition-transform active:scale-110 text-white hover:text-white/80"
              aria-label="Share reel"
            >
              <Send size={24} />
            </button>
            <span className="text-[11px] font-semibold drop-shadow">
              {currentReel.sharesCount > 1000
                ? `${(currentReel.sharesCount / 1000).toFixed(1)}k`
                : currentReel.sharesCount}
            </span>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmarkReel(currentReel.id)}
            className="p-2 transition-transform active:scale-110"
            aria-label="Save reel"
          >
            <Bookmark
              size={26}
              className={
                currentReel.isBookmarked
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-white hover:text-white/80'
              }
            />
          </button>

          {/* Audio Disc Spinning */}
          <div className="w-8 h-8 rounded-full border-2 border-white/60 p-0.5 overflow-hidden animate-spin">
            <img
              src={currentReel.audioTrack.coverUrl || currentReel.userAvatar}
              alt="Track"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Comments Drawer Overlay */}
        {isCommentsOpen && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="font-semibold text-sm text-white">Comments ({currentReel.comments.length})</span>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
              {currentReel.comments.length === 0 ? (
                <div className="text-center text-xs text-neutral-400 mt-10">
                  No comments yet. Start the conversation!
                </div>
              ) : (
                currentReel.comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs text-white">
                    <img
                      src={c.userAvatar}
                      alt={c.username}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{c.username}</span>
                        <span className="text-[10px] text-neutral-400">{c.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-neutral-200">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment for this reel..."
                className="flex-1 bg-neutral-900 text-white placeholder-neutral-500 rounded-full px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-rose-500 disabled:opacity-40 text-white font-semibold text-xs px-3 py-2 rounded-full hover:bg-rose-600 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
