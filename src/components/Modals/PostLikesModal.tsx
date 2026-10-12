import React, { useState } from 'react';
import { X, Search, Heart, BadgeCheck, UserCheck, UserPlus } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const PostLikesModal: React.FC = () => {
  const {
    activePostIdForLikesModal,
    closePostLikesModal,
    allPosts,
    allCreators,
    currentUser,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    theme,
  } = useInstagram();

  const [query, setQuery] = useState('');

  if (!activePostIdForLikesModal) return null;

  const post = allPosts.find(p => p.id === activePostIdForLikesModal);
  if (!post) return null;

  // Generate real likers list based on post's likers and platform creators
  // If the post has been liked by the currentUser, include currentUser in likers!
  const likersBase = [
    ...(post.hasLiked ? [currentUser] : []),
    ...allCreators,
  ].filter((u, idx, arr) => arr.findIndex(item => item.id === u.id) === idx);

  const filteredLikers = likersBase.filter(
    u =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.fullName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/40">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-sm tracking-tight">Likes</h3>
            <span className="text-xs text-neutral-400">
              ({post.likesCount.toLocaleString()})
            </span>
          </div>
          <button
            onClick={closePostLikesModal}
            className="p-1 text-neutral-400 hover:text-white rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-800/40">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              theme === 'dark'
                ? 'bg-neutral-950 border-neutral-800 text-white'
                : 'bg-neutral-100 border-neutral-200 text-neutral-900'
            }`}
          >
            <Search size={14} className="text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search likers..."
              className="bg-transparent w-full text-xs focus:outline-none placeholder:text-neutral-500"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Likers List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filteredLikers.length === 0 ? (
            <div className="text-center py-10 text-xs text-neutral-500">
              No matching likers found.
            </div>
          ) : (
            filteredLikers.map(user => {
              const isSelf = user.id === currentUser.id;
              const isFollowing = isFollowingUser(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/40 transition-colors"
                >
                  <div
                    onClick={() => {
                      openUserProfile(user.id);
                      closePostLikesModal();
                    }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700 flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs group-hover:underline truncate">
                          {user.username}
                        </span>
                        {user.isVerified && (
                          <BadgeCheck size={12} className="text-sky-500 fill-sky-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400 truncate">
                        {user.fullName}
                      </span>
                    </div>
                  </div>

                  {!isSelf ? (
                    <button
                      onClick={() => toggleFollowUser(user.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1 flex-shrink-0 ml-2 cursor-pointer active:scale-95 ${
                        isFollowing
                          ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                          : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={12} className="text-emerald-400" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={12} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-semibold px-2 py-1">
                      You
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
