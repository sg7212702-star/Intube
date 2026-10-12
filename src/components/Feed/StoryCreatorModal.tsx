import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Clock,
  RotateCcw,
  Type,
  Smile,
  Check,
  Send,
  Zap,
  Flame,
  Heart,
  Music,
  MapPin,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

interface FilterOption {
  id: string;
  name: string;
  cssOverlay: string;
  colorSwatch: string;
}

const STORY_FILTERS: FilterOption[] = [
  {
    id: 'normal',
    name: 'Original',
    cssOverlay: '',
    colorSwatch: 'bg-white/20',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    cssOverlay: 'bg-gradient-to-tr from-amber-500/35 via-rose-500/25 to-purple-600/30 mix-blend-overlay',
    colorSwatch: 'bg-gradient-to-tr from-amber-400 to-rose-500',
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    cssOverlay: 'bg-gradient-to-b from-cyan-400/30 via-fuchsia-500/25 to-blue-600/30 mix-blend-color',
    colorSwatch: 'bg-gradient-to-tr from-cyan-400 to-fuchsia-500',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    cssOverlay: 'bg-gradient-to-tr from-amber-400/40 via-orange-500/30 to-yellow-300/25 mix-blend-screen',
    colorSwatch: 'bg-gradient-to-tr from-yellow-400 to-orange-500',
  },
  {
    id: 'rose',
    name: 'Rose Pastel',
    cssOverlay: 'bg-gradient-to-tr from-rose-400/35 via-pink-500/25 to-fuchsia-400/20 mix-blend-soft-light',
    colorSwatch: 'bg-gradient-to-tr from-rose-300 to-pink-500',
  },
  {
    id: 'emerald',
    name: 'Emerald Aura',
    cssOverlay: 'bg-gradient-to-tr from-emerald-400/30 via-teal-500/25 to-cyan-700/25 mix-blend-overlay',
    colorSwatch: 'bg-gradient-to-tr from-emerald-400 to-teal-500',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Violet',
    cssOverlay: 'bg-gradient-to-tr from-violet-600/40 via-purple-700/30 to-indigo-900/35 mix-blend-multiply',
    colorSwatch: 'bg-gradient-to-tr from-purple-500 to-indigo-600',
  },
];

const PRESET_GALLERY_PHOTOS = [
  {
    title: 'Golden Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Neon Tokyo',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Aesthetic Coffee',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Mountain Peaks',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'City Lights',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
  },
];

const STICKER_EMOJIS = ['🔥', '✨', '❤️', '😍', '📸', '⚡', '☕', '📍', '🎵', '💫', '🌈'];

export const StoryCreatorModal: React.FC = () => {
  const { isStoryCreatorOpen, setIsStoryCreatorOpen, addStory } = useInstagram();

  const [mode, setMode] = useState<'camera' | 'edit'>('camera');
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [caption, setCaption] = useState<string>('');
  const [isCaptionEditing, setIsCaptionEditing] = useState<boolean>(false);
  const [activeStickers, setActiveStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera when in camera mode
  useEffect(() => {
    if (!isStoryCreatorOpen) {
      stopCamera();
      return;
    }

    if (mode === 'camera' && !capturedMedia) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isStoryCreatorOpen, mode, facingMode, capturedMedia]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or declined:', err?.message || err);
      setCameraError('Camera unavailable on this device or permission denied. Choose a photo from your gallery below!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Downsample & compress images so Firestore 1MB document limit is never exceeded
  const compressImage = (dataUrl: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = 900;
      const maxH = 1600;
      let width = img.width;
      let height = img.height;

      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(compressedDataUrl);
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          // Flip selfie snapshot
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedMedia(dataUrl);
        setMode('edit');
        stopCamera();
      }
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        compressImage(reader.result, (compressed) => {
          setCapturedMedia(compressed);
          setMode('edit');
          stopCamera();
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setCapturedMedia(url);
    setMode('edit');
    stopCamera();
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleAddSticker = (emoji: string) => {
    const newSticker = {
      id: `stk_${Date.now()}_${Math.random()}`,
      emoji,
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 40,
    };
    setActiveStickers(prev => [...prev, newSticker]);
  };

  const handlePublishStory = async () => {
    if (!capturedMedia) return;
    setIsUploading(true);

    try {
      await addStory(capturedMedia, caption, selectedFilter);
      setIsUploading(false);
      handleClose();
    } catch (err) {
      console.error('Error adding story:', err);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsStoryCreatorOpen(false);
    setMode('camera');
    setCapturedMedia(null);
    setCaption('');
    setSelectedFilter('normal');
    setActiveStickers([]);
  };

  if (!isStoryCreatorOpen) return null;

  const currentFilterObj = STORY_FILTERS.find(f => f.id === selectedFilter);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center select-none animate-in fade-in duration-200">
      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Story Container with Transparent Colorful Accents */}
      <div className="relative w-full max-w-md h-full max-h-[92vh] sm:rounded-3xl overflow-hidden border border-white/20 bg-neutral-950 flex flex-col shadow-[0_0_60px_rgba(244,63,94,0.3)]">
        {/* Top Floating Transparent HUD Header */}
        <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between pointer-events-auto">
          {/* Close button with transparent blur pill */}
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all active:scale-90 shadow-xl cursor-pointer"
            aria-label="Close story creator"
          >
            <X size={20} />
          </button>

          {/* 24-Hour Expiration & Firestore Status Tag */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-fuchsia-500/25 border border-white/25 text-white px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Clock size={13} className="text-amber-300" />
            <span className="text-xs font-bold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-white bg-clip-text text-transparent">
              24h Story · Real-time Firestore
            </span>
          </div>

          {/* Right Action: Text overlay toggle or flip camera */}
          {mode === 'edit' ? (
            <button
              onClick={() => setIsCaptionEditing(prev => !prev)}
              className={`w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                caption || isCaptionEditing
                  ? 'bg-rose-500/80 border-rose-400 text-white'
                  : 'bg-white/10 hover:bg-white/25 border-white/25 text-white'
              }`}
              title="Add text caption"
            >
              <Type size={18} />
            </button>
          ) : (
            <button
              onClick={handleFlipCamera}
              className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all active:scale-90 shadow-xl cursor-pointer"
              title="Flip camera"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </header>

        {/* Story Viewport / Canvas Area */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {mode === 'camera' && !capturedMedia ? (
            /* Live Camera Viewfinder */
            <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {/* Camera Fallback / Error Alert */}
              {cameraError && (
                <div className="absolute inset-x-6 top-24 z-20 p-5 rounded-2xl backdrop-blur-2xl bg-black/80 border border-white/25 text-white text-center shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500/20 to-rose-500/30 text-rose-300 flex items-center justify-center mx-auto mb-2.5 border border-rose-400/30">
                    <Camera size={22} />
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium mb-3">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full backdrop-blur-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-xs font-bold shadow-lg cursor-pointer hover:opacity-90 active:scale-95"
                  >
                    Open Gallery
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Captured Media Preview & Filters Canvas */
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
              <img
                src={capturedMedia || ''}
                alt="Story preview"
                className="w-full h-full object-cover"
              />

              {/* Transparent Colorful Filter Overlay */}
              {currentFilterObj && currentFilterObj.cssOverlay && (
                <div
                  className={`absolute inset-0 pointer-events-none transition-all duration-300 ${currentFilterObj.cssOverlay}`}
                />
              )}

              {/* Placed Emoji Stickers */}
              {activeStickers.map(stk => (
                <div
                  key={stk.id}
                  style={{ top: `${stk.y}%`, left: `${stk.x}%` }}
                  className="absolute text-5xl select-none pointer-events-none drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] animate-in zoom-in-75 duration-150 transform -translate-x-1/2 -translate-y-1/2"
                >
                  {stk.emoji}
                </div>
              ))}

              {/* Text Caption Overlay (if entered) */}
              {caption && !isCaptionEditing && (
                <div className="absolute bottom-32 left-6 right-6 z-20 text-center">
                  <div className="inline-block px-4 py-2 rounded-2xl backdrop-blur-xl bg-black/60 border border-white/25 text-white font-bold text-base shadow-2xl max-w-full break-words">
                    {caption}
                  </div>
                </div>
              )}

              {/* Interactive Caption Editor Modal Overlay */}
              {isCaptionEditing && (
                <div className="absolute inset-0 z-30 backdrop-blur-md bg-black/75 flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-xs space-y-3.5">
                    <input
                      type="text"
                      autoFocus
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Type a colorful thought..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/15 border border-white/30 text-white placeholder-white/60 font-semibold text-center text-lg focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xl backdrop-blur-xl"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setIsCaptionEditing(false)}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white font-bold text-xs shadow-xl active:scale-95 cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Floating Controls Toolbar */}
        {mode === 'camera' && !capturedMedia ? (
          /* Camera Controls Bar with Transparent Colorful Buttons */
          <div className="absolute bottom-0 left-0 right-0 z-30 p-5 pt-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-4">
            {/* Quick Gallery Presets Carousel */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block mb-2 px-1 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Quick Photo Gallery Presets</span>
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                {PRESET_GALLERY_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset.url)}
                    className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/25 hover:border-rose-400 flex-shrink-0 transition-transform active:scale-95 cursor-pointer shadow-lg group"
                    title={preset.title}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Shutter Button & Gallery Picker Button */}
            <div className="flex items-center justify-around pt-1">
              {/* Gallery button with transparent glass look */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-13 h-13 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 hover:from-purple-500/30 hover:to-rose-500/30 border border-white/25 text-white flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl cursor-pointer"
                title="Upload from device gallery"
              >
                <ImageIcon size={20} className="text-rose-300" />
                <span className="text-[9px] font-semibold mt-0.5">Gallery</span>
              </button>

              {/* Shutter Button: Transparent White Glowing Ring */}
              <button
                onClick={handleCaptureSnapshot}
                className="w-20 h-20 rounded-full border-4 border-white/90 bg-white/20 backdrop-blur-2xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_35px_rgba(244,63,94,0.4)] cursor-pointer"
                title="Take Photo"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-inner" />
              </button>

              {/* Flip camera button */}
              <button
                onClick={handleFlipCamera}
                className="w-13 h-13 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/25 text-white flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl cursor-pointer"
                title="Switch camera"
              >
                <RefreshCw size={20} className="text-neutral-200" />
                <span className="text-[9px] font-semibold mt-0.5">Flip</span>
              </button>
            </div>
          </div>
        ) : (
          /* Editing & Filters Controls Bar */
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pt-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-3">
            {/* Horizontal Filter Swatches Carousel */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-white/80 mb-2 px-1">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Color & Gradient Filters</span>
                </span>
                <span className="text-rose-300 font-semibold">
                  {currentFilterObj?.name}
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {STORY_FILTERS.map(f => {
                  const isSelected = selectedFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl p-[2px] transition-all ${
                          isSelected
                            ? 'ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                            : 'opacity-70 group-hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-full h-full rounded-[14px] ${f.colorSwatch} border border-white/25 backdrop-blur-md flex items-center justify-center`}
                        >
                          {isSelected && <Check size={14} className="text-white drop-shadow" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-white/80 truncate max-w-[55px]">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Sticker Stamp Emojis */}
            <div className="flex items-center justify-between gap-1 px-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-semibold text-white/70 flex items-center gap-1 flex-shrink-0 mr-1">
                <Smile size={12} className="text-amber-300" />
                <span>Stamps:</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {STICKER_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleAddSticker(emoji)}
                    className="p-1.5 rounded-xl backdrop-blur-xl bg-white/10 hover:bg-white/25 border border-white/15 text-sm transition-transform active:scale-125 cursor-pointer shadow-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Retake vs Share 24h Story */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setCapturedMedia(null);
                  setMode('camera');
                  setCaption('');
                  setActiveStickers([]);
                }}
                className="flex-1 py-3 px-4 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <RotateCcw size={15} />
                <span>Retake</span>
              </button>

              <button
                onClick={handlePublishStory}
                disabled={isUploading}
                className="flex-[2] py-3 px-5 rounded-2xl backdrop-blur-xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 hover:brightness-110 border border-white/30 text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.4)] cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Syncing with Firestore...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Share 24h Story · Firestore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
