import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Camera, Sparkles } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const StoriesTray: React.FC = () => {
  const {
    currentUser,
    activeStoriesGroups,
    setViewingStoryUserId,
    setIsStoryCreatorOpen,
    theme,
  } = useInstagram();

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check if current user has active stories
  const myStoriesGroup = activeStoriesGroups.find(g => g.userId === currentUser.id);
  const hasMyStories = myStoriesGroup && myStoriesGroup.stories.length > 0;

  return (
    <div className="relative w-full max-w-xl mx-auto py-3 px-2 mb-2 select-none">
      {/* Scroll Left Button - Transparent Colorful Glass */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full backdrop-blur-xl bg-white/15 hover:bg-white/30 border border-white/25 text-white shadow-xl items-center justify-center transition-all cursor-pointer active:scale-90"
        aria-label="Previous Stories"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Stories list container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
      >
        {/* Your Story item */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
          <div
            onClick={() => {
              if (hasMyStories) {
                setViewingStoryUserId(currentUser.id);
              } else {
                setIsStoryCreatorOpen(true);
              }
            }}
            className="relative"
          >
            <div
              className={`w-16 h-16 rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 ${
                hasMyStories && !myStoriesGroup.allSeen
                  ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                  : hasMyStories
                  ? 'bg-gradient-to-tr from-purple-500/80 via-pink-500/80 to-amber-400/80'
                  : 'bg-gradient-to-tr from-white/20 via-rose-500/30 to-amber-500/30 border border-white/20 hover:border-rose-400'
              }`}
            >
              <div
                className={`w-full h-full rounded-full overflow-hidden p-[2px] ${
                  theme === 'dark' ? 'bg-black' : 'bg-white'
                }`}
              >
                <img
                  src={currentUser.avatar}
                  alt="Your story"
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Transparent Colorful Plus button to open camera/gallery story creator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsStoryCreatorOpen(true);
              }}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full backdrop-blur-xl bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-amber-500 hover:brightness-125 text-white flex items-center justify-center border-2 border-black/80 shadow-[0_0_12px_rgba(244,63,94,0.7)] group-hover:scale-110 transition-all cursor-pointer"
              title="Add 24h Story from Camera or Gallery"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
          <span className="text-xs tracking-tight text-neutral-300 group-hover:text-white transition-colors truncate max-w-[72px] font-medium flex items-center gap-0.5">
            Your story
          </span>
        </div>

        {/* Quick Direct Transparent "+ Story" Add Button */}
        <button
          onClick={() => setIsStoryCreatorOpen(true)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          title="Create New 24h Story"
        >
          <div className="w-16 h-16 rounded-full backdrop-blur-xl bg-gradient-to-tr from-purple-500/15 via-rose-500/20 to-amber-500/20 hover:from-purple-500/30 hover:to-amber-500/30 border border-white/25 hover:border-white/50 text-white flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]">
            <Camera size={20} className="text-rose-400 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-bold tracking-wider text-rose-300 group-hover:text-white uppercase mt-0.5">
              + 24h
            </span>
          </div>
          <span className="text-xs tracking-tight text-rose-400/90 group-hover:text-rose-300 transition-colors font-medium">
            New Story
          </span>
        </button>

        {/* Other Users' Stories */}
        {activeStoriesGroups
          .filter(group => group.userId !== currentUser.id)
          .map(group => {
            const isUnseen = !group.allSeen;

            return (
              <div
                key={group.userId}
                onClick={() => setViewingStoryUserId(group.userId)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              >
                <div
                  className={`w-16 h-16 rounded-full transition-transform duration-300 group-hover:scale-105 p-[2.5px] ${
                    isUnseen
                      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                      : theme === 'dark'
                      ? 'bg-neutral-800'
                      : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full overflow-hidden p-[2px] ${
                      theme === 'dark' ? 'bg-black' : 'bg-white'
                    }`}
                  >
                    <img
                      src={group.userAvatar}
                      alt={group.username}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className="text-xs tracking-tight text-neutral-300 group-hover:text-white transition-colors truncate max-w-[70px]">
                  {group.username}
                </span>
              </div>
            );
          })}
      </div>

      {/* Scroll Right Button - Transparent Colorful Glass */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full backdrop-blur-xl bg-white/15 hover:bg-white/30 border border-white/25 text-white shadow-xl items-center justify-center transition-all cursor-pointer active:scale-90"
        aria-label="Next Stories"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
