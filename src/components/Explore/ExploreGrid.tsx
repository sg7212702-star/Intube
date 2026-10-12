import React, { useState } from 'react';
import { Search, Heart, MessageCircle, Film, Bookmark } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';
import { Post } from '../../types/instagram';

export const ExploreGrid: React.FC = () => {
  const {
    explorePosts,
    allPosts,
    savedPostIds,
    toggleBookmarkPost,
    toggleLikePost,
    setSelectedPostForDetail,
    theme,
  } = useInstagram();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('For You');

  const categories = [
    'For You',
    'Photography',
    'Travel',
    'Architecture',
    'Style',
    'Food',
    'Reels',
    'Tech',
  ];

  // Combine and deduplicate posts
  const combinedPosts = [...allPosts, ...explorePosts].filter(
    (post, index, self) => index === self.findIndex(p => p.id === post.id)
  );

  // Filter posts based on search query and category
  const filteredPosts = combinedPosts.filter(post => {
    const matchesSearch =
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'For You') return true;
    if (selectedCategory === 'Photography') return post.caption.toLowerCase().includes('photo') || post.caption.toLowerCase().includes('lens');
    if (selectedCategory === 'Travel') return post.caption.toLowerCase().includes('valley') || post.caption.toLowerCase().includes('beach') || post.caption.toLowerCase().includes('travel');
    if (selectedCategory === 'Food') return post.caption.toLowerCase().includes('food') || post.caption.toLowerCase().includes('pizza') || post.caption.toLowerCase().includes('bake');
    if (selectedCategory === 'Style') return post.caption.toLowerCase().includes('fashion') || post.caption.toLowerCase().includes('style') || post.caption.toLowerCase().includes('ootd');
    if (selectedCategory === 'Architecture') return post.caption.toLowerCase().includes('architecture') || post.caption.toLowerCase().includes('city');
    if (selectedCategory === 'Reels') return post.mediaType === 'video';

    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-2 md:px-4 py-4 mb-16 md:mb-6">
      {/* Search Header */}
      <div className="mb-4">
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
            theme === 'dark'
              ? 'bg-neutral-900 border-neutral-800 text-white'
              : 'bg-neutral-100 border-neutral-300 text-black'
          }`}
        >
          <Search size={18} className="text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search accounts, tags, or places..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-neutral-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills / Filter bar (Interactive functional buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
        {categories.map(category => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-500 text-white shadow-sm'
                  : theme === 'dark'
                  ? 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Grid of posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 text-sm">
          No posts found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-3">
          {filteredPosts.map((post, index) => {
            // Instagram signature layout: every 6th item can be large
            const isLarge = index % 10 === 1 || index % 10 === 8;

            const isSaved = savedPostIds.includes(post.id) || post.isBookmarked;

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPostForDetail(post)}
                className={`relative group cursor-pointer overflow-hidden rounded-md bg-neutral-900 ${
                  isLarge ? 'row-span-2 col-span-1 md:row-span-2' : 'aspect-square'
                }`}
              >
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    post.filter ? `filter-${post.filter}` : ''
                  }`}
                  loading="lazy"
                />

                {/* Reel icon badge if video */}
                {post.mediaType === 'video' && (
                  <div className="absolute top-2.5 right-2.5 text-white drop-shadow-md">
                    <Film size={18} />
                  </div>
                )}

                {/* Bookmark badge if already saved */}
                {isSaved && (
                  <div className="absolute top-2.5 left-2.5 p-1 rounded-full bg-black/60 backdrop-blur-sm text-amber-400">
                    <Bookmark size={14} className="fill-amber-400" />
                  </div>
                )}

                {/* Dark hover overlay with Likes, Comments, and Quick Bookmark */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-semibold text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikePost(post.id);
                    }}
                    className="flex items-center gap-1.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    title={post.hasLiked ? 'Unlike post' : 'Like post'}
                  >
                    <Heart
                      size={18}
                      className={post.hasLiked ? 'fill-rose-500 text-rose-500' : 'fill-white text-white'}
                    />
                    <span>{post.likesCount.toLocaleString()}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={18} className="fill-white" />
                    <span>{post.commentsCount.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkPost(post.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    title={isSaved ? 'Remove from Saved' : 'Save post'}
                    aria-label={isSaved ? 'Remove from Saved' : 'Save post'}
                  >
                    <Bookmark
                      size={18}
                      className={isSaved ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-white'}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
