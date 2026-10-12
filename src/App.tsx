import React, { useState } from 'react';
import { InstagramProvider, useInstagram } from './context/InstagramContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { MobileHeader, MobileBottomNav } from './components/Navigation/MobileNav';
import { FeedView } from './components/Feed/FeedView';
import { ExploreGrid } from './components/Explore/ExploreGrid';
import { ReelsView } from './components/Reels/ReelsView';
import { DirectChat } from './components/Direct/DirectChat';
import { NotificationsDrawer } from './components/Notifications/NotificationsDrawer';
import { ProfileView } from './components/Profile/ProfileView';
import { StoryViewerModal } from './components/Feed/StoryViewerModal';
import { StoryCreatorModal } from './components/Feed/StoryCreatorModal';
import { CreatePostModal } from './components/Modals/CreatePostModal';
import { PostDetailModal } from './components/Modals/PostDetailModal';
import { ShareModal } from './components/Modals/ShareModal';
import { SearchModal } from './components/Modals/SearchModal';
import { AuthModal } from './components/Auth/AuthModal';
import { SaveToast } from './components/Navigation/SaveToast';
import { FollowToast } from './components/Navigation/FollowToast';
import { UserProfileModal } from './components/Modals/UserProfileModal';
import { PostLikesModal } from './components/Modals/PostLikesModal';
import { FollowListModal } from './components/Modals/FollowListModal';

const AppContent: React.FC = () => {
  const { activeTab, theme, isAuthModalOpen, setIsAuthModalOpen } = useInstagram();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <FeedView />;
      case 'explore':
      case 'search':
        return <ExploreGrid />;
      case 'reels':
        return <ReelsView />;
      case 'messages':
        return <DirectChat />;
      case 'notifications':
        return <NotificationsDrawer />;
      case 'profile':
        return <ProfileView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors ${
        theme === 'dark' ? 'bg-black text-neutral-100' : 'bg-neutral-50 text-neutral-900'
      }`}
    >
      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Desktop Navigation Sidebar */}
      <Sidebar onOpenSearchModal={() => setIsSearchModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen overflow-y-auto no-scrollbar">
        {renderActiveTab()}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Interactive Modals */}
      <StoryViewerModal />
      <StoryCreatorModal />
      <CreatePostModal />
      <PostDetailModal />
      <ShareModal />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <SaveToast />
      <FollowToast />
      <UserProfileModal />
      <PostLikesModal />
      <FollowListModal />
    </div>
  );
};

export default function App() {
  return (
    <InstagramProvider>
      <AppContent />
    </InstagramProvider>
  );
}
