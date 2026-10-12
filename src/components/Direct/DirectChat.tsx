import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Heart,
  Image,
  Phone,
  Video,
  Info,
  Smile,
  Check,
  CheckCheck,
  Clock,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useInstagram } from '../../context/InstagramContext';

export const DirectChat: React.FC = () => {
  const {
    currentUser,
    chatThreads,
    activeChatId,
    setActiveChatId,
    sendMessage,
    toggleMessageLike,
    theme,
  } = useInstagram();

  const [messageInput, setMessageInput] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = chatThreads.find(th => th.id === activeChatId) || (chatThreads.length > 0 ? chatThreads[0] : null);

  useEffect(() => {
    if (!activeChatId && chatThreads.length > 0) {
      setActiveChatId(chatThreads[0].id);
    }
  }, [chatThreads, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedThread) return;
    sendMessage(selectedThread.id, messageInput);
    setMessageInput('');
  };

  const handleSendPhotoSimulation = () => {
    if (!selectedThread) return;
    const samplePhotos = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    ];
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    sendMessage(selectedThread.id, 'Check out this shot! 📸', randomPhoto);
  };

  const renderStatusTick = (status?: 'sending' | 'sent' | 'delivered' | 'seen') => {
    switch (status) {
      case 'sending':
        return (
          <span title="Sending..." className="inline-flex items-center text-neutral-400">
            <Clock size={11} className="animate-spin text-neutral-400" />
          </span>
        );
      case 'sent':
        return (
          <span title="Sent (Single check)" className="inline-flex items-center text-neutral-400">
            <Check size={13} strokeWidth={2.5} />
          </span>
        );
      case 'delivered':
        return (
          <span title="Delivered (Double check)" className="inline-flex items-center text-neutral-400">
            <CheckCheck size={14} strokeWidth={2.5} />
          </span>
        );
      case 'seen':
      default:
        return (
          <span title="Seen (Read)" className="inline-flex items-center text-sky-400">
            <CheckCheck size={14} strokeWidth={2.5} />
          </span>
        );
    }
  };

  const filteredThreads = chatThreads.filter(th =>
    th.participant.username.toLowerCase().includes(searchContact.toLowerCase()) ||
    th.participant.fullName.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div
      className={`w-full max-w-5xl mx-auto h-[calc(100vh-3.5rem)] md:h-[calc(100vh-2rem)] my-0 md:my-4 border rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm transition-colors ${
        theme === 'dark'
          ? 'bg-neutral-950 border-neutral-800 text-white'
          : 'bg-white border-neutral-200 text-neutral-900'
      }`}
    >
      {/* Threads Sidebar (Visible or hidden on mobile when thread is selected) */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r flex flex-col transition-colors ${
          theme === 'dark' ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-50/50'
        } ${activeChatId ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Current user header */}
        <div className="p-4 border-b border-neutral-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight">{currentUser.username}</span>
          </div>
          <span className="text-xs text-rose-500 font-semibold px-2 py-0.5 rounded-full bg-rose-500/10">
            Direct
          </span>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-neutral-800/40">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
              theme === 'dark'
                ? 'bg-neutral-900 border-neutral-800 text-white'
                : 'bg-white border-neutral-200 text-black'
            }`}
          >
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              value={searchContact}
              onChange={e => setSearchContact(e.target.value)}
              placeholder="Search messages..."
              className="bg-transparent w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredThreads.map(thread => {
            const isSelected = selectedThread?.id === thread.id;
            return (
              <div
                key={thread.id}
                onClick={() => setActiveChatId(thread.id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-neutral-900'
                      : 'bg-neutral-200/60'
                    : 'hover:bg-neutral-500/10'
                }`}
              >
                {/* Avatar with active indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={thread.participant.avatar}
                    alt={thread.participant.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {thread.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">
                      {thread.participant.username}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {thread.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 text-xs text-neutral-400">
                      {thread.messages.length > 0 && thread.messages[thread.messages.length - 1].senderId === currentUser.id ? (
                        <>
                          <span className="text-neutral-500 flex-shrink-0">You:</span>
                          <span className="truncate">{thread.lastMessage}</span>
                          <span className="flex-shrink-0">
                            {renderStatusTick(thread.messages[thread.messages.length - 1].status)}
                          </span>
                        </>
                      ) : (
                        <p className="truncate text-xs text-neutral-400">{thread.lastMessage}</p>
                      )}
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 ml-1.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Conversation View */}
      {selectedThread ? (
        <div
          className={`flex-1 flex flex-col h-full ${
            !activeChatId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Conversation Header */}
          <header className="p-3.5 border-b border-neutral-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Back button */}
              <button
                onClick={() => setActiveChatId(null)}
                className="md:hidden p-1 text-neutral-400 hover:text-white"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="relative">
                <img
                  src={selectedThread.participant.avatar}
                  alt={selectedThread.participant.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
                {selectedThread.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                )}
              </div>

              <div>
                <div className="font-semibold text-sm leading-tight">
                  {selectedThread.participant.fullName}
                </div>
                <div className="text-[11px] text-neutral-400">
                  @{selectedThread.participant.username} · {selectedThread.isOnline ? 'Active now' : 'Active 2h ago'}
                </div>
              </div>
            </div>

            {/* Mock Call / Info Action Buttons */}
            <div className="flex items-center gap-3 text-neutral-400">
              <button
                onClick={() => alert(`Calling @${selectedThread.participant.username}...`)}
                className="p-1.5 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                title="Voice Call"
              >
                <Phone size={20} />
              </button>
              <button
                onClick={() => alert(`Starting video call with @${selectedThread.participant.username}...`)}
                className="p-1.5 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                title="Video Call"
              >
                <Video size={21} />
              </button>
              <button
                className="p-1.5 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                title="Conversation Info"
              >
                <Info size={20} />
              </button>
            </div>
          </header>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {/* Contact introduction header */}
            <div className="flex flex-col items-center justify-center my-6 text-center">
              <img
                src={selectedThread.participant.avatar}
                alt={selectedThread.participant.username}
                className="w-20 h-20 rounded-full object-cover mb-2 ring-2 ring-neutral-700"
              />
              <span className="font-bold text-base">{selectedThread.participant.fullName}</span>
              <span className="text-xs text-neutral-400">@{selectedThread.participant.username} · InTube</span>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">{selectedThread.participant.bio}</p>
            </div>

            {/* Message Bubbles */}
            {(() => {
              const lastOutgoingIndex = selectedThread.messages.reduce(
                (lastIdx, m, idx) => (m.senderId === currentUser.id ? idx : lastIdx),
                -1
              );

              return selectedThread.messages.map((msg, index) => {
                const isMine = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="relative max-w-[78%] flex items-end gap-2">
                      {!isMine && (
                        <img
                          src={selectedThread.participant.avatar}
                          alt="avatar"
                          className="w-6 h-6 rounded-full object-cover mb-1 flex-shrink-0"
                        />
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm transition-all shadow-sm ${
                          isMine
                            ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white rounded-br-sm'
                            : theme === 'dark'
                            ? 'bg-neutral-800 text-white rounded-bl-sm'
                            : 'bg-neutral-200 text-neutral-900 rounded-bl-sm'
                        }`}
                      >
                        {/* Attached media image if present */}
                        {msg.mediaUrl && (
                          <img
                            src={msg.mediaUrl}
                            alt="Media attachment"
                            className="rounded-xl max-h-56 w-full object-cover mb-2"
                          />
                        )}

                        <p className="leading-snug break-words">{msg.text}</p>
                      </div>

                      {/* Double-tap or heart reaction toggle */}
                      <button
                        onClick={() => toggleMessageLike(selectedThread.id, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-400 hover:text-rose-500"
                        title="Like message"
                      >
                        <Heart
                          size={14}
                          className={msg.hasLiked ? 'text-rose-500 fill-rose-500' : ''}
                        />
                      </button>
                    </div>

                    {/* Reaction badge if liked */}
                    {msg.hasLiked && (
                      <div className={`mt-0.5 ${isMine ? 'mr-3' : 'ml-8'}`}>
                        <span className="text-xs">❤️</span>
                      </div>
                    )}

                    {/* Timestamp & Read Status Indicators (Ticks) */}
                    <div
                      className={`flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1 px-1 ${
                        isMine ? 'mr-1 justify-end' : 'ml-8'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMine && (
                        <span className="flex items-center">
                          {renderStatusTick(msg.status)}
                        </span>
                      )}
                    </div>

                    {/* Instagram-style Last Message Status / Seen Avatar Indicator */}
                    {isMine && index === lastOutgoingIndex && (
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5 mr-1 font-medium select-none">
                        {msg.status === 'seen' || !msg.status ? (
                          <div className="flex items-center gap-1 text-neutral-400">
                            <span>Seen</span>
                            <img
                              src={selectedThread.participant.avatar}
                              alt={selectedThread.participant.username}
                              className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-neutral-700"
                              title={`Seen by ${selectedThread.participant.username}`}
                            />
                          </div>
                        ) : msg.status === 'delivered' ? (
                          <span className="text-neutral-500">Delivered</span>
                        ) : msg.status === 'sent' ? (
                          <span className="text-neutral-500">Sent</span>
                        ) : (
                          <span className="text-neutral-500">Sending...</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer */}
          <footer className="p-3 border-t border-neutral-800/40">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-full border ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-neutral-100 border-neutral-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMessageInput(prev => prev + '🔥')}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <Smile size={20} />
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-neutral-500"
                />

                <button
                  type="button"
                  onClick={handleSendPhotoSimulation}
                  className="text-neutral-400 hover:text-white transition-colors"
                  title="Send Photo"
                >
                  <Image size={20} />
                </button>
              </div>

              {messageInput.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  <Send size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => sendMessage(selectedThread.id, '❤️')}
                  className="p-2.5 text-rose-500 hover:scale-110 transition-transform"
                >
                  <Heart size={24} className="fill-rose-500" />
                </button>
              )}
            </form>
          </footer>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-neutral-400">
          <Send size={48} className="mb-3 text-neutral-500" />
          <h3 className="text-lg font-bold text-white mb-1">Your Messages</h3>
          <p className="text-sm max-w-sm">Send private photos and messages to a friend or group.</p>
        </div>
      )}
    </div>
  );
};
