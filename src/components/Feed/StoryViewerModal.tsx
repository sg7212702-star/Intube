import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Send,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

const STORY_FILTER_OVERLAYS: Record<string, string> = {
  normal: '',
  sunset: 'bg-gradient-to-tr from-amber-500/35 via-rose-500/25 to-purple-600/30 mix-blend-overlay',
  neon: 'bg-gradient-to-b from-cyan-400/30 via-fuchsia-500/25 to-blue-600/30 mix-blend-color',
  golden: 'bg-gradient-to-tr from-amber-400/40 via-orange-500/30 to-yellow-300/25 mix-blend-screen',
  rose: 'bg-gradient-to-tr from-rose-400/35 via-pink-500/25 to-fuchsia-400/20 mix-blend-soft-light',
  emerald: 'bg-gradient-to-tr from-emerald-400/30 via-teal-500/25 to-cyan-700/25 mix-blend-overlay',
  cosmic: 'bg-gradient-to-tr from-violet-600/40 via-purple-700/30 to-indigo-900/35 mix-blend-multiply',
};

export const StoryViewerModal: React.FC = () => {
  const {
    viewingStoryUserId,
    setViewingStoryUserId,
    allStoriesGroups,
    markStoriesSeen,
    sendMessage,
    chatThreads,
    currentUser,
    openUserProfile,
    deleteStory,
  } = useInstagram();

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeGroup = allStoriesGroups.find(g => g.userId === viewingStoryUserId);
  const activeStory = activeGroup ? activeGroup.stories[currentStoryIndex] : null;

  // Mark this user's story as seen
  useEffect(() => {
    if (viewingStoryUserId) {
      markStoriesSeen(viewingStoryUserId);
    }
  }, [viewingStoryUserId]);

  // Reset index when changing user
  useEffect(() => {
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
  }, [viewingStoryUserId]);

  // Handle progression timer
  useEffect(() => {
    if (!activeGroup || !activeStory || isPaused) return;

    const intervalTime = 50; // ms
    const totalDuration = (activeStory.duration || 5) * 1000;
    const increment = (intervalTime / totalDuration) * 100;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [activeGroup, activeStory, isPaused, currentStoryIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNextStory();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroup, currentStoryIndex]);

  if (!activeGroup || !activeStory) return null;

  const handleClose = () => {
    setViewingStoryUserId(null);
    setCurrentStoryIndex(0);
    setProgress(0);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < activeGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Find next user's story group
      const currentGroupIndex = allStoriesGroups.findIndex(g => g.userId === activeGroup.userId);
      if (currentGroupIndex < allStoriesGroups.length - 1) {
        setViewingStoryUserId(allStoriesGroups[currentGroupIndex + 1].userId);
      } else {
        handleClose();
      }
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      const currentGroupIndex = allStoriesGroups.findIndex(g => g.userId === activeGroup.userId);
      if (currentGroupIndex > 0) {
        const prevGroup = allStoriesGroups[currentGroupIndex - 1];
        setViewingStoryUserId(prevGroup.userId);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const handleDeleteActiveStory = async () => {
    if (!activeStory) return;
    setIsDeleting(true);
    setIsPaused(true);
    try {
      await deleteStory(activeStory.id);
      setIsDeleting(false);
      if (activeGroup.stories.length > 1) {
        if (currentStoryIndex > 0) {
          setCurrentStoryIndex(prev => prev - 1);
        }
        setProgress(0);
      } else {
        handleClose();
      }
    } catch (err) {
      console.error('Failed to delete story:', err);
      setIsDeleting(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeGroup) return;

    const thread = chatThreads.find(th => th.participant.id === activeGroup.userId);
    if (thread) {
      sendMessage(thread.id, `Replied to story: "${replyText}"`);
    }
    setReactionBurst('Sent! ✉️');
    setTimeout(() => setReactionBurst(null), 1500);
    setReplyText('');
  };

  const handleSendQuickReaction = (emoji: string) => {
    setReactionBurst(emoji);
    setTimeout(() => setReactionBurst(null), 1200);

    const thread = chatThreads.find(th => th.participant.id === activeGroup.userId);
    if (thread) {
      sendMessage(thread.id, `Reacted to story: ${emoji}`);
    }
  };

  // Calculate 24-hour remaining countdown
  const getExpiryCountdown = () => {
    if (!activeStory.expiresAtTimestamp) return '24h Story';
    const diffMs = activeStory.expiresAtTimestamp - Date.now();
    if (diffMs <= 0) return 'Expiring soon';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const isMyStory = activeGroup.userId === currentUser.id;
  const filterOverlayClass = activeStory.filter ? STORY_FILTER_OVERLAYS[activeStory.filter] || '' : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center select-none animate-in fade-in duration-200">
      {/* Top Floating Transparent Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 w-11 h-11 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50 active:scale-95 shadow-xl"
        aria-label="Close stories"
      >
        <X size={22} />
      </button>

      {/* Desktop Navigation Arrows: Transparent Colorful Glass */}
      <button
        onClick={handlePrevStory}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xl"
        aria-label="Previous story"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={handleNextStory}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xl"
        aria-label="Next story"
      >
        <ChevronRight size={28} />
      </button>

      {/* Main Story Container (9:16 aspect ratio) */}
      <div
        className="relative w-full max-w-[420px] h-[92vh] max-h-[840px] bg-neutral-950 sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/15 flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars & Header */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-3.5 flex flex-col gap-2.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {activeGroup.stories.map((story, idx) => {
              let fillWidth = '0%';
              if (idx < currentStoryIndex) {
                fillWidth = '100%';
              } else if (idx === currentStoryIndex) {
                fillWidth = `${progress}%`;
              }

              return (
                <div
                  key={story.id}
                  className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 via-rose-300 to-white rounded-full transition-all duration-75 shadow-sm"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Profile & 24h Expiry Row */}
          <div className="flex items-center justify-between text-white mt-0.5">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(true);
                openUserProfile(activeGroup.userId);
              }}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 group"
            >
              <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-md">
                <img
                  src={activeGroup.userAvatar}
                  alt={activeGroup.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white group-hover:underline">
                    {activeGroup.username}
                  </span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-white/70 text-xs font-medium">{activeStory.timestamp}</span>
                </div>

                {/* 24-Hour Expiration Badge */}
                <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                  <Clock size={10} className="text-amber-400" />
                  <span>{getExpiryCountdown()}</span>
                  <span className="text-emerald-400">· Real-time</span>
                </div>
              </div>
            </div>

            {/* Right Controls: Play/Pause and optional Delete button */}
            <div className="flex items-center gap-1.5">
              {isMyStory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteActiveStory();
                  }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-full backdrop-blur-xl bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/40 text-rose-200 transition-all cursor-pointer active:scale-95"
                  title="Delete this 24h story"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(p => !p);
                }}
                className="p-1.5 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
                title={isPaused ? 'Resume story' : 'Pause story'}
              >
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Story Media (Image / Filter) */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <img
            src={activeStory.mediaUrl}
            alt={activeStory.caption || 'Story'}
            className="w-full h-full object-cover"
          />

          {/* Color & Gradient Filter Overlay */}
          {filterOverlayClass && (
            <div className={`absolute inset-0 pointer-events-none ${filterOverlayClass}`} />
          )}

          {/* Touch/Click navigation zones */}
          <div
            onClick={handlePrevStory}
            className="absolute top-16 bottom-24 left-0 w-1/3 z-20 cursor-pointer"
            title="Previous story"
          />
          <div
            onClick={handleNextStory}
            className="absolute top-16 bottom-24 right-0 w-2/3 z-20 cursor-pointer"
            title="Next story"
          />

          {/* Caption banner with transparent colourful glassmorphism */}
          {activeStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20 text-center pointer-events-none">
              <div className="inline-block px-4 py-2 rounded-2xl backdrop-blur-xl bg-black/60 border border-white/25 text-white font-bold text-sm shadow-2xl max-w-full break-words">
                {activeStory.caption}
              </div>
            </div>
          )}

          {/* Reaction burst animation overlay */}
          {reactionBurst && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <span className="text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                {reactionBurst}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Reply Bar & Quick Emojis with Transparent Colourful Designs */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2.5">
          {/* Quick Reaction Emojis - Transparent Glass Badges */}
          <div className="flex items-center justify-around px-2">
            {['❤️', '🔥', '😂', '😍', '👏', '✨'].map(emoji => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendQuickReaction(emoji);
                }}
                className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/15 text-xl flex items-center justify-center hover:scale-125 active:scale-95 transition-transform cursor-pointer shadow-md"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Direct Reply Form */}
          <form
            onSubmit={handleSendReply}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${activeGroup.username}...`}
              className="flex-1 backdrop-blur-xl bg-white/15 text-white placeholder-white/60 border border-white/25 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-lg"
            />
            {replyText.trim() ? (
              <button
                type="submit"
                className="backdrop-blur-xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shadow-lg shadow-rose-500/30 cursor-pointer"
              >
                Send
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendQuickReaction('❤️')}
                className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 hover:bg-rose-500/30 border border-white/20 text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90"
                title="Like story"
              >
                <Heart size={20} className="fill-rose-500 text-rose-500" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
