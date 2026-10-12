import React, { useState } from 'react';
import { Search, X, BadgeCheck } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';
import { INITIAL_USERS } from '../../data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const {
    allPosts,
    allCreators,
    setSelectedPostForDetail,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    theme,
  } = useInstagram();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matchedUsers = allCreators.filter(
    u =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.fullName.toLowerCase().includes(query.toLowerCase())
  );

  const matchedPosts = allPosts.filter(p =>
    p.caption.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div
        className={`w-full max-w-md rounded-2xl p-4 border shadow-2xl flex flex-col max-h-[75vh] ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-black'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 flex-1">
            <Search size={18} className="text-neutral-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search accounts or posts..."
              className="bg-transparent w-full text-sm focus:outline-none placeholder:text-neutral-500"
            />
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-xs text-neutral-500">
              Type a name, handle or keyword to search
            </div>
          ) : (
            <>
              {/* Accounts */}
              {matchedUsers.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Accounts
                  </span>
                  <div className="space-y-2">
                    {matchedUsers.map(user => {
                      const isFollowing = isFollowingUser(user.id);

                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/60 transition-colors"
                        >
                          <div
                            onClick={() => {
                              openUserProfile(user.id);
                              onClose();
                            }}
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          >
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-xs truncate">{user.username}</span>
                                {user.isVerified && (
                                  <BadgeCheck size={12} className="text-sky-500 fill-sky-500" />
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400 truncate block">
                                {user.fullName}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleFollowUser(user.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all flex-shrink-0 cursor-pointer active:scale-95 ${
                              isFollowing
                                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20'
                            }`}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Posts matching */}
              {matchedPosts.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Posts
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {matchedPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => {
                          setSelectedPostForDetail(post);
                          onClose();
                        }}
                        className="aspect-square rounded-lg overflow-hidden bg-neutral-950 cursor-pointer group"
                      >
                        <img
                          src={post.mediaUrl}
                          alt={post.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedUsers.length === 0 && matchedPosts.length === 0 && (
                <div className="text-center py-8 text-xs text-neutral-400">
                  No accounts or posts found matching "{query}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
