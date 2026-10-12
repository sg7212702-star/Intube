import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Film,
  Camera,
  MapPin,
  Music,
  Sliders,
  Check,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const CreatePostModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createPost,
    createReel,
    addStory,
    setActiveTab,
    theme,
  } = useInstagram();

  const [contentType, setContentType] = useState<'post' | 'reel' | 'story'>('post');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);

  if (!isCreateModalOpen) return null;

  const filters = [
    { id: 'normal', name: 'Normal' },
    { id: 'clarendon', name: 'Clarendon' },
    { id: 'gingham', name: 'Gingham' },
    { id: 'juno', name: 'Juno' },
    { id: 'lark', name: 'Lark' },
    { id: 'moon', name: 'Moon' },
    { id: 'slumber', name: 'Slumber' },
    { id: 'reyes', name: 'Reyes' },
  ];

  const presetImages = [
    {
      title: 'Mountain Sunrise',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
    },
    {
      title: 'Urban Neon Lights',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
    },
    {
      title: 'Artisan Cafe Vibes',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80',
    },
    {
      title: 'Coastal Sunset',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    },
    {
      title: 'Editorial Style',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080&auto=format&fit=crop&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewMedia(objectUrl);
      setMediaUrl(objectUrl);
    }
  };

  const handleSelectPreset = (url: string) => {
    setPreviewMedia(url);
    setMediaUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = previewMedia || mediaUrl.trim();
    if (!finalUrl) {
      alert('Please upload an image/video or choose a preset sample!');
      return;
    }

    if (contentType === 'post') {
      createPost({
        mediaUrl: finalUrl,
        mediaType: 'image',
        caption: caption.trim() || 'Aesthetic moments ✨',
        location: location.trim() || undefined,
        filter: selectedFilter === 'normal' ? undefined : selectedFilter,
        aspectRatio,
      });
      setActiveTab('home');
    } else if (contentType === 'reel') {
      // Default working sample video if user selected an image for reel
      const reelVideoUrl = finalUrl.endsWith('.mp4') || finalUrl.includes('video')
        ? finalUrl
        : 'https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-with-forest-and-snow-1262-large.mp4';
      createReel(
        reelVideoUrl,
        caption.trim() || 'New aesthetic reel 🎬 #trending',
        audioTitle.trim() || undefined
      );
      setActiveTab('reels');
    } else if (contentType === 'story') {
      addStory(finalUrl, caption.trim() || undefined);
      setActiveTab('home');
    }

    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div
        className={`w-full max-w-2xl rounded-2xl overflow-hidden border shadow-2xl flex flex-col max-h-[92vh] ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-black'
        }`}
      >
        {/* Modal Header */}
        <header className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">Create New</span>
            <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setContentType('post')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  contentType === 'post' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setContentType('reel')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  contentType === 'reel' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Reel
              </button>
              <button
                type="button"
                onClick={() => setContentType('story')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  contentType === 'story' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Story
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {/* Media Preview / Upload Dropzone */}
          <div className="space-y-3">
            {previewMedia ? (
              <div className="relative aspect-square max-h-80 mx-auto rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                <img
                  src={previewMedia}
                  alt="Upload preview"
                  className={`w-full h-full object-cover ${
                    selectedFilter !== 'normal' ? `filter-${selectedFilter}` : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMedia(null);
                    setMediaUrl('');
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-neutral-500 transition-colors bg-neutral-800/30">
                <UploadCloud size={40} className="text-neutral-400 mb-2" />
                <p className="text-sm font-semibold mb-1">Drag photos or videos here</p>
                <p className="text-xs text-neutral-400 mb-4">Supports PNG, JPG, MP4 or WebP</p>

                <label className="cursor-pointer px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition-colors">
                  Select from computer
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Or Paste Direct Image URL */}
            <div className="text-xs">
              <label className="block text-neutral-400 font-semibold mb-1">
                Or paste image/video URL directly
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={e => {
                    setMediaUrl(e.target.value);
                    setPreviewMedia(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                />
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewMedia(mediaUrl)}
                    className="px-3 py-2 bg-neutral-700 rounded-lg text-xs font-semibold"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            {/* Quick Aesthetic Presets */}
            <div>
              <span className="text-[11px] text-neutral-400 font-semibold block mb-1.5">
                Quick Aesthetic Presets:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {presetImages.map(item => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleSelectPreset(item.url)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:border-rose-500 text-xs bg-neutral-800/50 transition-colors"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-5 h-5 rounded object-cover"
                    />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instagram Filters Bar */}
          {contentType === 'post' && (
            <div className="pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-2">
                <Sliders size={14} />
                <span>Photo Filters</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {filters.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedFilter === f.id
                        ? 'bg-rose-500 text-white border-rose-500 font-bold'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="text-xs">
            <label className="block text-neutral-400 font-semibold mb-1">
              {contentType === 'story' ? 'Story Caption (optional)' : 'Caption & Hashtags'}
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write an engaging caption... #instamood #vibes"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-xs focus:outline-none focus:border-rose-500 placeholder:text-neutral-500"
            />
          </div>

          {/* Location & Audio details */}
          {contentType === 'post' && (
            <div className="text-xs">
              <label className="block text-neutral-400 font-semibold mb-1">
                Add Location
              </label>
              <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2">
                <MapPin size={16} className="text-neutral-400" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Bandra West, Mumbai or Spiti Valley"
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>
          )}

          {contentType === 'reel' && (
            <div className="text-xs">
              <label className="block text-neutral-400 font-semibold mb-1">
                Audio Track Title
              </label>
              <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2">
                <Music size={16} className="text-neutral-400" />
                <input
                  type="text"
                  value={audioTitle}
                  onChange={e => setAudioTitle(e.target.value)}
                  placeholder="e.g. Synthwave Golden Hour (Original Audio)"
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
            >
              Share Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
