import React, { useEffect } from 'react';
import { UserCheck, UserPlus, X, RotateCcw } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const FollowToast: React.FC = () => {
  const { followToast, dismissFollowToast, undoFollow, theme } = useInstagram();

  useEffect(() => {
    if (!followToast) return;
    const timer = setTimeout(() => {
      dismissFollowToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [followToast, dismissFollowToast]);

  if (!followToast) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${
          theme === 'dark'
            ? 'bg-neutral-900/95 border-neutral-800 text-white'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-rose-500/5'
        }`}
      >
        {/* User avatar with status indicator */}
        <div className="relative">
          <img
            src={followToast.avatar}
            alt={followToast.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-500/30"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
              followToast.isFollowing
                ? 'bg-emerald-500 text-white'
                : 'bg-neutral-600 text-neutral-200'
            }`}
          >
            {followToast.isFollowing ? (
              <UserCheck size={9} />
            ) : (
              <UserPlus size={9} />
            )}
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col pr-1">
          <span className="text-xs font-semibold leading-tight">
            {followToast.message}
          </span>
          <span className="text-[10px] text-neutral-400">
            {followToast.isFollowing
              ? 'Stories and posts will show in your feed'
              : 'Posts removed from home feed'}
          </span>
        </div>

        {/* Undo Button */}
        <button
          onClick={undoFollow}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
        >
          <RotateCcw size={11} />
          <span>Undo</span>
        </button>

        {/* Close Button */}
        <button
          onClick={dismissFollowToast}
          className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
