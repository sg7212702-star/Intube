import React from 'react';
import { Bookmark, X, ExternalLink } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const SaveToast: React.FC = () => {
  const { saveToast, dismissSaveToast, setActiveTab, setProfileTab, theme } = useInstagram();

  if (!saveToast || !saveToast.show) return null;

  const isSaved = saveToast.isSaved !== false;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-sm w-[90%] md:w-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${
          theme === 'dark'
            ? 'bg-neutral-900/95 border-neutral-700/80 text-white'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-neutral-400/20'
        }`}
      >
        {/* Bookmark Icon pill */}
        <div
          className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSaved
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-neutral-500/15 text-neutral-400'
          }`}
        >
          <Bookmark
            size={18}
            className={isSaved ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}
          />
        </div>

        {/* Message Content */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-semibold tracking-tight leading-snug">
            {saveToast.message}
          </span>
          <span className="text-[11px] text-neutral-400 truncate">
            {isSaved ? 'Saved to your private collection' : 'Post removed from your saved list'}
          </span>
        </div>

        {/* View in Saved Action Button */}
        {isSaved && (
          <button
            onClick={() => {
              setActiveTab('profile');
              setProfileTab('saved');
              dismissSaveToast();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-bold transition-all whitespace-nowrap ml-1 cursor-pointer"
          >
            <span>View</span>
            <ExternalLink size={12} />
          </button>
        )}

        {/* Dismiss Button */}
        <button
          onClick={dismissSaveToast}
          className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-500/10 transition-colors ml-0.5 cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
