import React from 'react';
import { BadgeCheck, Sparkles, UserPlus, UserCheck } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const SuggestionsSidebar: React.FC = () => {
  const {
    currentUser,
    allCreators,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    setActiveTab,
    setIsAuthModalOpen,
    theme,
  } = useInstagram();

  return (
    <aside className="hidden xl:block w-80 py-4 px-4 select-none">
      {/* Current User Row */}
      <div className="flex items-center justify-between mb-5">
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-12 h-12 rounded-full object-cover ring-1 ring-neutral-700"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-white group-hover:underline flex items-center gap-1">
              {currentUser.username}
              {currentUser.isVerified && (
                <BadgeCheck size={13} className="text-sky-500 fill-sky-500" />
              )}
            </span>
            <span className="text-[11px] text-neutral-400 truncate max-w-[140px]">
              {currentUser.fullName}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
          title="Switch or Register New Account"
        >
          Switch
        </button>
      </div>

      {/* Suggested Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-neutral-400 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" />
          <span>Suggested for you</span>
        </span>
        <button
          onClick={() => setActiveTab('explore')}
          className="font-semibold text-white hover:text-neutral-300 text-[11px]"
        >
          See All
        </button>
      </div>

      {/* Suggested List from Real Platform Creators */}
      <div className="space-y-3 mb-6">
        {allCreators.slice(0, 5).map(user => {
          const isFollowing = isFollowingUser(user.id);

          return (
            <div key={user.id} className="flex items-center justify-between">
              <div
                onClick={() => openUserProfile(user.id)}
                className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0 mr-2"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs group-hover:underline flex items-center gap-1 truncate">
                    {user.username}
                    {user.isVerified && (
                      <BadgeCheck size={12} className="text-sky-500 fill-sky-500 flex-shrink-0" />
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-500 truncate">
                    {user.followersCount.toLocaleString()} followers
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleFollowUser(user.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 flex-shrink-0 active:scale-95 cursor-pointer ${
                  isFollowing
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={11} className="text-emerald-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={11} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subtle Instagram Footer Links */}
      <div className="text-[11px] text-neutral-500 leading-normal space-y-3">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language'].map(link => (
            <span key={link} className="hover:underline cursor-pointer">
              {link} ·
            </span>
          ))}
        </div>
        <div>© 2026 INTUBE SOCIAL FROM META</div>
      </div>
    </aside>
  );
};
