import React, { useState } from 'react';
import { 
  ServerInfo, 
  CharacterData, 
  GuildData, 
  AccountData, 
  DbEngine 
} from './types/openmu';
import { 
  initialServerInfo, 
  initialRankings, 
  initialGuilds, 
  demoAccounts 
} from './data/mockOpenMuData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RankingsSection } from './components/RankingsSection';
import { ClassShowcaseSection } from './components/ClassShowcaseSection';
import { EventScheduleSection } from './components/EventScheduleSection';
import { DownloadsSection } from './components/DownloadsSection';
import { PhpArchitectureSection } from './components/PhpArchitectureSection';
import { Footer } from './components/Footer';
import { AccountPanelModal } from './components/AccountPanelModal';

export default function App() {
  const [serverInfo] = useState<ServerInfo>(initialServerInfo);
  const [rankings, setRankings] = useState<CharacterData[]>(initialRankings);
  const [guilds] = useState<GuildData[]>(initialGuilds);
  const [allAccounts, setAllAccounts] = useState<AccountData[]>(demoAccounts);
  const [currentAccount, setCurrentAccount] = useState<AccountData | null>(null);

  const [selectedDb, setSelectedDb] = useState<DbEngine>('postgresql');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'login' | 'register'>('login');

  // Open modal with specific tab
  const handleOpenAccountModal = (tab: 'login' | 'register' = 'login') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
  };

  // Register new account
  const handleRegisterAccount = (newAcc: AccountData) => {
    setAllAccounts((prev) => [...prev, newAcc]);
    // Add character to rankings
    if (newAcc.characters.length > 0) {
      setRankings((prev) => [newAcc.characters[0], ...prev]);
    }
  };

  // Update account (after reset, PK clear, add stats, or warp)
  const handleUpdateAccount = (updatedAcc: AccountData) => {
    setCurrentAccount(updatedAcc);
    setAllAccounts((prev) =>
      prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a))
    );

    // Synchronize rankings list
    setRankings((prev) =>
      prev.map((c) => {
        const found = updatedAcc.characters.find((uc) => uc.id === c.id);
        return found ? found : c;
      })
    );
  };

  // Scroll to PHP section
  const handleScrollToPhp = () => {
    const el = document.getElementById('php-architecture');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        currentAccount={currentAccount}
        onOpenAccountModal={handleOpenAccountModal}
        onLogout={() => setCurrentAccount(null)}
        selectedDb={selectedDb}
        onSelectDb={setSelectedDb}
      />

      {/* Hero Banner Section */}
      <HeroSection
        serverInfo={serverInfo}
        onOpenRegister={() => handleOpenAccountModal('register')}
        onOpenPhpSection={handleScrollToPhp}
      />

      {/* Hall of Fame / Leaderboards */}
      <RankingsSection
        rankings={rankings}
        guilds={guilds}
        selectedDb={selectedDb}
        onOpenPhpSection={handleScrollToPhp}
      />

      {/* Character Classes Showcase */}
      <ClassShowcaseSection />

      {/* Daily Battles & Invasions Timers */}
      <EventScheduleSection />

      {/* Official Game Client Downloads */}
      <DownloadsSection />

      {/* Dedicated PHP 8.3 & PostgreSQL/MySQL Architecture Suite */}
      <PhpArchitectureSection
        selectedDb={selectedDb}
        onSelectDb={setSelectedDb}
      />

      {/* Footer */}
      <Footer />

      {/* Player Account & Character Management Modal */}
      <AccountPanelModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentAccount={currentAccount}
        onLogin={(acc) => {
          setCurrentAccount(acc);
          setIsAccountModalOpen(true);
        }}
        onLogout={() => {
          setCurrentAccount(null);
          setIsAccountModalOpen(false);
        }}
        allAccounts={allAccounts}
        onRegisterAccount={handleRegisterAccount}
        onUpdateAccount={handleUpdateAccount}
        initialTab={accountModalTab}
      />
    </div>
  );
}
