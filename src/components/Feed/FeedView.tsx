import React from 'react';
import { StoriesTray } from './StoriesTray';
import { PostCard } from './PostCard';
import { SuggestionsSidebar } from './SuggestionsSidebar';
import { useInstagram } from '../../context/InstagramContext';
import {
  Camera,
  PlusCircle,
  UserPlus,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Compass,
  BadgeCheck,
} from 'lucide-react';

export const FeedView: React.FC = () => {
  const {
    currentUser,
    homeFeedPosts,
    allPosts,
    allCreators,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    setIsCreateModalOpen,
    setActiveTab,
    theme,
  } = useInstagram();

  // Algorithmic suggested posts based on user's interests (not yet followed)
  const unfollowedPosts = allPosts.filter(
    p => !(currentUser.followingUserIds || []).includes(p.userId) && p.userId !== currentUser.id
  );

  const hasFollowedOrPosted = homeFeedPosts.length > 0;

  return (
    <div className="w-full flex justify-center gap-8 px-2 md:px-4 py-3 mb-16 md:mb-6">
      {/* Center Feed Stream */}
      <main className="w-full max-w-xl flex flex-col items-center">
        {/* Stories Horizontal Tray */}
        <StoriesTray />

        {/* FEED CONTENT */}
        {!hasFollowedOrPosted ? (
          /* REAL INSTAGRAM ONBOARDING / ZERO-STATE ALGORITHMIC SCREEN */
          <div className="w-full space-y-6 my-2">
            {/* Welcome Card */}
            <div
              className={`p-6 rounded-3xl border text-center transition-colors ${
                theme === 'dark'
                  ? 'bg-neutral-950 border-neutral-800 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 p-[2px]">
                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-white">
                  <Camera size={30} />
                </div>
              </div>

              <h2 className="text-lg font-bold tracking-tight">
                Welcome to InTube, @{currentUser.username}!
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Your feed is 100% real. When you follow creators, their daily stories and posts will appear right here.
              </p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors shadow-lg shadow-rose-500/20"
                >
                  <PlusCircle size={15} />
                  <span>Share First Photo</span>
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors"
                >
                  <Compass size={15} />
                  <span>Explore Trending</span>
                </button>
              </div>
            </div>

            {/* Algorithmic "Suggested Creators to Follow" Carousel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Suggested Creators for You</span>
                </span>
                <span className="text-[11px] text-neutral-500">
                  Based on: {(currentUser.interests || ['Visuals']).join(', ')}
                </span>
              </div>

              {/* Creators Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allCreators.map(creator => {
                  const isFollowing = isFollowingUser(creator.id);
                  // Grab 2-3 preview images from this creator
                  const creatorPreviews = allPosts
                    .filter(p => p.userId === creator.id)
                    .slice(0, 3);

                  return (
                    <div
                      key={creator.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                        theme === 'dark'
                          ? 'bg-neutral-900/60 border-neutral-800 text-white'
                          : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
                      }`}
                    >
                      <div
                        onClick={() => openUserProfile(creator.id)}
                        className="flex items-center gap-3 mb-3 cursor-pointer group"
                      >
                        <img
                          src={creator.avatar}
                          alt={creator.username}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-700 group-hover:ring-rose-500 transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-xs truncate group-hover:underline">
                              {creator.username}
                            </span>
                            {creator.isVerified && (
                              <BadgeCheck size={13} className="text-sky-500 fill-sky-500 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 truncate block">
                            {creator.fullName}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {creator.followersCount.toLocaleString()} followers
                          </span>
                        </div>
                      </div>

                      {/* Photo preview strip */}
                      {creatorPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 mb-3 rounded-lg overflow-hidden">
                          {creatorPreviews.map((prevPost, idx) => (
                            <img
                              key={idx}
                              src={prevPost.mediaUrl}
                              alt="preview"
                              className="aspect-square object-cover w-full h-full"
                            />
                          ))}
                        </div>
                      )}

                      {/* Follow Button */}
                      <button
                        onClick={() => toggleFollowUser(creator.id)}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                          isFollowing
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                            : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck size={14} className="text-emerald-400" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending Sample Posts */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold text-neutral-400">
                <Compass size={14} />
                <span>Trending Posts to Discover</span>
              </div>
              <div className="space-y-4">
                {unfollowedPosts.slice(0, 2).map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR FEED WITH REAL FOLLOWED POSTS + ALGORITHMIC RECOMMENDATIONS */
          <div className="w-full flex flex-col items-center">
            {/* Followed Posts */}
            {homeFeedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* "You're All Caught Up" Indicator */}
            <div className="w-full my-6 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 text-center flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-sm text-white">You're All Caught Up</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                You've seen all new posts from accounts you follow.
              </p>
            </div>

            {/* Algorithmic "Suggested Posts" Section */}
            {unfollowedPosts.length > 0 && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between px-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles size={14} className="text-rose-500" />
                    <span>Suggested Posts</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Based on your interests: {(currentUser.interests || ['Visuals']).join(', ')}
                  </span>
                </div>

                {unfollowedPosts.slice(0, 4).map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Desktop Suggestions Sidebar */}
      <SuggestionsSidebar />
    </div>
  );
};
