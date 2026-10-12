import React, { useState } from 'react';
import {
  Home,
  Search,
  Compass,
  Film,
  Send,
  Heart,
  PlusSquare,
  Moon,
  Sun,
  Menu,
  Bookmark,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';
import { ActiveTab } from '../../types/instagram';

interface SidebarProps {
  onOpenSearchModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearchModal }) => {
  const {
    activeTab,
    setActiveTab,
    setProfileTab,
    currentUser,
    unreadMessagesCount,
    unreadNotificationsCount,
    theme,
    toggleTheme,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
  } = useInstagram();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'search' as ActiveTab, label: 'Search', icon: Search, onClick: () => {
      if (onOpenSearchModal) {
        onOpenSearchModal();
      } else {
        setActiveTab('explore');
      }
    }},
    { id: 'explore' as ActiveTab, label: 'Explore', icon: Compass },
    { id: 'reels' as ActiveTab, label: 'Reels', icon: Film },
    {
      id: 'messages' as ActiveTab,
      label: 'Messages',
      icon: Send,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'notifications' as ActiveTab,
      label: 'Notifications',
      icon: Heart,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: 'create' as ActiveTab,
      label: 'Create',
      icon: PlusSquare,
      onClick: () => setIsCreateModalOpen(true),
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Profile',
      customAvatar: currentUser.avatar,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 border-r transition-colors z-30 select-none ${
        theme === 'dark'
          ? 'bg-black border-neutral-800 text-neutral-100'
          : 'bg-white border-neutral-200 text-neutral-900'
      } w-18 lg:w-64 px-3 lg:px-4 py-6`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="cursor-pointer px-2 py-2 flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {/* Mobile/Tablet icon logo */}
          <div className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 p-[2px]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <span className="font-bold text-white text-base">In</span>
            </div>
          </div>

          {/* Desktop full wordmark */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-instagram-logo text-3xl tracking-wide bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
              InTube
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Social
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-neutral-900 font-bold'
                      : 'bg-neutral-100 font-bold'
                    : 'hover:bg-neutral-500/10 font-normal'
                } justify-center lg:justify-start`}
                title={item.label}
              >
                <div className="relative flex items-center justify-center">
                  {item.customAvatar ? (
                    <div
                      className={`w-6 h-6 rounded-full overflow-hidden p-[1.5px] ${
                        isActive
                          ? 'ring-2 ring-rose-500'
                          : 'ring-1 ring-neutral-400'
                      }`}
                    >
                      <img
                        src={item.customAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  ) : Icon ? (
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 1.75}
                      className={`transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? theme === 'dark'
                            ? 'text-white'
                            : 'text-black'
                          : theme === 'dark'
                          ? 'text-neutral-300'
                          : 'text-neutral-700'
                      }`}
                    />
                  ) : null}

                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`hidden lg:inline-block text-[15px] tracking-tight ${
                    isActive ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme & More */}
      <div className="relative flex flex-col gap-1.5 pt-4 border-t border-neutral-800/40">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all hover:bg-neutral-500/10 justify-center lg:justify-start ${
            theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
          }`}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={24} strokeWidth={1.75} /> : <Moon size={24} strokeWidth={1.75} />}
          <span className="hidden lg:inline-block text-[15px]">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* More Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(prev => !prev)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all hover:bg-neutral-500/10 justify-center lg:justify-start ${
              isMoreMenuOpen ? 'font-semibold' : ''
            }`}
            title="More Options"
          >
            <Menu size={24} strokeWidth={1.75} />
            <span className="hidden lg:inline-block text-[15px]">More</span>
          </button>

          {/* More Dropdown Menu */}
          {isMoreMenuOpen && (
            <div
              className={`absolute bottom-full left-0 mb-3 w-56 rounded-2xl p-2 shadow-2xl border backdrop-blur-md z-50 ${
                theme === 'dark'
                  ? 'bg-neutral-900/95 border-neutral-800 text-neutral-200'
                  : 'bg-white/95 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="px-3 py-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/50 mb-1">
                Account & Settings
              </div>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setProfileTab('saved');
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-neutral-500/10 text-left transition-colors cursor-pointer"
              >
                <Bookmark size={18} />
                <span>Saved Posts</span>
              </button>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-neutral-500/10 text-left transition-colors"
              >
                <Sparkles size={18} />
                <span>Switch Appearance</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-neutral-500/10 text-left transition-colors"
              >
                <Settings size={18} />
                <span>Edit Profile</span>
              </button>
              <div className="h-[1px] bg-neutral-800/60 my-1" />
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 text-left transition-colors"
              >
                <LogOut size={18} />
                <span>Switch / Register (Start 0)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
