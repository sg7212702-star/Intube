import React from 'react';
import {
  Home,
  Compass,
  PlusSquare,
  Film,
  Heart,
  Send,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';
import { ActiveTab } from '../../types/instagram';

export const MobileHeader: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    unreadMessagesCount,
    unreadNotificationsCount,
  } = useInstagram();

  return (
    <header
      className={`md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-13 border-b backdrop-blur-md transition-colors ${
        theme === 'dark'
          ? 'bg-black/90 border-neutral-800 text-white'
          : 'bg-white/90 border-neutral-200 text-black'
      }`}
    >
      <div
        onClick={() => setActiveTab('home')}
        className="cursor-pointer flex items-center gap-1.5"
      >
        <span className="font-instagram-logo text-2xl tracking-wide bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
          InTube
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Icon with badge */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-1 transition-opacity hover:opacity-70"
          aria-label="Notifications"
        >
          <Heart
            size={24}
            strokeWidth={activeTab === 'notifications' ? 2.5 : 1.75}
            className={activeTab === 'notifications' ? 'text-rose-500 fill-rose-500' : ''}
          />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Messages Icon with badge */}
        <button
          onClick={() => setActiveTab('messages')}
          className="relative p-1 transition-opacity hover:opacity-70"
          aria-label="Messages"
        >
          <Send
            size={22}
            strokeWidth={activeTab === 'messages' ? 2.5 : 1.75}
            className={activeTab === 'messages' ? 'text-rose-500' : ''}
          />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setIsCreateModalOpen,
    theme,
  } = useInstagram();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-14 border-t backdrop-blur-md transition-colors ${
        theme === 'dark'
          ? 'bg-black/95 border-neutral-800 text-neutral-200'
          : 'bg-white/95 border-neutral-200 text-neutral-800'
      }`}
      aria-label="Mobile Bottom Navigation"
    >
      <button
        onClick={() => setActiveTab('home')}
        className="p-2 transition-transform active:scale-90"
        aria-label="Home"
      >
        <Home
          size={24}
          strokeWidth={activeTab === 'home' ? 2.5 : 1.75}
          className={activeTab === 'home' ? 'text-rose-500' : ''}
        />
      </button>

      <button
        onClick={() => setActiveTab('explore')}
        className="p-2 transition-transform active:scale-90"
        aria-label="Explore"
      >
        <Compass
          size={24}
          strokeWidth={activeTab === 'explore' ? 2.5 : 1.75}
          className={activeTab === 'explore' ? 'text-rose-500' : ''}
        />
      </button>

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="p-2 transition-transform active:scale-90"
        aria-label="Create Post"
      >
        <PlusSquare size={26} strokeWidth={1.75} />
      </button>

      <button
        onClick={() => setActiveTab('reels')}
        className="p-2 transition-transform active:scale-90"
        aria-label="Reels"
      >
        <Film
          size={24}
          strokeWidth={activeTab === 'reels' ? 2.5 : 1.75}
          className={activeTab === 'reels' ? 'text-rose-500' : ''}
        />
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className="p-2 transition-transform active:scale-90"
        aria-label="Profile"
      >
        <div
          className={`w-7 h-7 rounded-full overflow-hidden p-[1.5px] ${
            activeTab === 'profile'
              ? 'ring-2 ring-rose-500'
              : 'ring-1 ring-neutral-400'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt="My Profile"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </button>
    </nav>
  );
};
