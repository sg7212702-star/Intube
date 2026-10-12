import React, { useState } from 'react';
import { X, Copy, Check, Send } from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const ShareModal: React.FC = () => {
  const {
    shareModalData,
    setShareModalData,
    chatThreads,
    sendMessage,
    theme,
  } = useInstagram();

  const [copied, setCopied] = useState(false);
  const [sentThreads, setSentThreads] = useState<string[]>([]);

  if (!shareModalData) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareModalData.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToThread = (threadId: string) => {
    sendMessage(threadId, `Shared link: ${shareModalData.url}`, shareModalData.image);
    setSentThreads(prev => [...prev, threadId]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-white'
            : 'bg-white border-neutral-200 text-black'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <h3 className="font-bold text-sm">Share Post</h3>
          <button
            onClick={() => setShareModalData(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview snippet */}
        {shareModalData.image && (
          <div className="flex items-center gap-3 p-2 bg-neutral-800/40 rounded-xl mb-4 border border-neutral-800">
            <img
              src={shareModalData.image}
              alt="Shared media"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{shareModalData.title}</p>
              <p className="text-[10px] text-neutral-400 truncate">{shareModalData.url}</p>
            </div>
          </div>
        )}

        {/* Share to Direct Contacts */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-neutral-400 block mb-2">
            Send via Direct Message
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {chatThreads.map(th => {
              const isSent = sentThreads.includes(th.id);
              return (
                <div
                  key={th.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={th.participant.avatar}
                      alt={th.participant.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-xs">
                      <span className="font-semibold block">{th.participant.fullName}</span>
                      <span className="text-neutral-400 text-[10px]">@{th.participant.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendToThread(th.id)}
                    disabled={isSent}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      isSent
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {isSent ? 'Sent' : 'Send'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition-colors"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};
