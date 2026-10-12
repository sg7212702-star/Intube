import React, { useState } from 'react';
import { Camera, Check, Sparkles, User as UserIcon, Lock, Mail, AtSign, ArrowRight, X } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { registerUser, loginUser, resetToZeroAccount, currentUser, theme } = useInstagram();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Photography', 'Travel']);

  if (!isOpen) return null;

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  const interestOptions = [
    { id: 'Photography', label: '📸 Photography' },
    { id: 'Travel', label: '🏔️ Travel' },
    { id: 'Fashion', label: '👗 Fashion' },
    { id: 'Food', label: '🍕 Food & Dining' },
    { id: 'Tech', label: '💻 Tech & Design' },
    { id: 'Fitness', label: '🏋️ Fitness' },
    { id: 'Music', label: '🎵 Music' },
    { id: 'Nature', label: '🌿 Nature' },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      alert('Please enter your full name and username');
      return;
    }

    registerUser({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      email: email.trim() || `${username.trim()}@example.com`,
      avatar,
      bio: bio.trim() || `📸 New to InTube | Interested in ${selectedInterests.join(', ')}`,
      interests: selectedInterests,
    });

    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter your username or email');
      return;
    }
    loginUser(username.trim());
    onClose();
  };

  const handleQuickResetZero = () => {
    resetToZeroAccount();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 border shadow-2xl my-auto transition-colors ${
          theme === 'dark'
            ? 'bg-neutral-950 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2">
          <span className="font-instagram-logo text-4xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent block">
            InTube
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'signup'
              ? 'Sign up to see photos and videos from your friends.'
              : 'Log in to continue your social experience.'}
          </p>
        </div>

        {/* Tabs: Sign Up vs Log In */}
        <div className="flex rounded-xl bg-neutral-900/80 p-1 mb-5 border border-neutral-800">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create New Account (Start 0)
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Log In
          </button>
        </div>

        {mode === 'signup' ? (
          /* Sign Up Form */
          <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
            {/* Avatar Selector */}
            <div>
              <label className="block text-neutral-400 font-semibold mb-2">
                Choose Profile Photo
              </label>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex-shrink-0">
                  <img
                    src={avatar}
                    alt="Selected avatar"
                    className="w-full h-full object-cover rounded-full bg-neutral-900"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {defaultAvatars.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 transition-transform ${
                          avatar === url ? 'border-rose-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <label className="text-[11px] text-rose-400 hover:underline cursor-pointer inline-flex items-center gap-1 mt-1">
                    <Camera size={12} />
                    <span>Upload custom photo</span>
                    <input type="file" accept="image/*" onChange={handleCustomAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Full Name</label>
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
                  <UserIcon size={14} className="text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Username</label>
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
                  <AtSign size={14} className="text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. rahul_creatives"
                    className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Email</label>
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
                  <Mail size={14} className="text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Password</label>
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
                  <Lock size={14} className="text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Algorithm Interests Picker */}
            <div>
              <label className="block text-neutral-400 font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400" />
                <span>Select Your Interests (Algorithm Feeds)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {interestOptions.map(opt => {
                  const isChecked = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleInterest(opt.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                        isChecked
                          ? 'bg-rose-500/20 border-rose-500 text-white font-semibold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zero State Guarantee Notice */}
            <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
              <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>
                Account starts completely real from zero: <strong>0 Followers, 0 Following, 0 Posts</strong>. All content updates purely based on whom you follow and what you post!
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Create My Account (Start from 0)</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          /* Log In Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Username or Email</label>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5">
                <UserIcon size={14} className="text-neutral-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Password</label>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5">
                <Lock size={14} className="text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors"
            >
              Log In
            </button>

            {/* Quick One-Click Actions */}
            <div className="pt-3 border-t border-neutral-800/80 space-y-2">
              <span className="text-[11px] text-neutral-500 font-semibold block text-center">
                Quick Test Shortcuts
              </span>

              <button
                type="button"
                onClick={handleQuickResetZero}
                className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>⚡ Instant Fresh Account (0 Followers, 0 Following)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginUser('sameer_creatives');
                  onClose();
                }}
                className="w-full py-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors"
              >
                Demo Creator Account (@sameer_creatives)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
