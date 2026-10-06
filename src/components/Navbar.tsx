import React from 'react';
import { AccountData, DbEngine } from '../types/openmu';
import { Shield, User, Download, Database, Trophy, Calendar, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentAccount: AccountData | null;
  onOpenAccountModal: (tab?: 'login' | 'register') => void;
  onLogout: () => void;
  selectedDb: DbEngine;
  onSelectDb: (engine: DbEngine) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentAccount,
  onOpenAccountModal,
  onLogout,
  selectedDb,
  onSelectDb,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="#" 
          className="text-lg sm:text-xl font-bold tracking-wider text-amber-400 font-cinzel hover:text-amber-300 transition-colors whitespace-nowrap"
        >
          OPENMU · LORENCIA
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <a href="#rankings" className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500/80" />
            อันดับผู้เล่น
          </a>
          <a href="#classes" className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-500/80" />
            สายอาชีพ
          </a>
          <a href="#events" className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500/80" />
            กิจกรรม
          </a>
          <a href="#downloads" className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Download className="w-4 h-4 text-amber-500/80" />
            ดาวน์โหลด
          </a>
          <a href="#php-architecture" className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5 text-amber-300 font-semibold">
            <Database className="w-4 h-4 text-amber-400" />
            PHP 8.3 & DB
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* DB Engine Quick Indicator / Switcher */}
          <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onSelectDb('postgresql')}
              className={`px-2.5 py-1 rounded font-mono transition-colors ${
                selectedDb === 'postgresql'
                  ? 'bg-sky-950/80 text-sky-400 border border-sky-600/40 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="OpenMU Native PostgreSQL PDO"
            >
              PostgreSQL
            </button>
            <button
              onClick={() => onSelectDb('mysql')}
              className={`px-2.5 py-1 rounded font-mono transition-colors ${
                selectedDb === 'mysql'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-600/40 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Classic Web MySQL PDO"
            >
              MySQL
            </button>
          </div>

          {currentAccount ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAccountModal()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-amber-300 text-xs font-medium hover:border-amber-500/50 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{currentAccount.loginName}</span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1 transition-colors"
              >
                ออก
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAccountModal('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => onOpenAccountModal('register')}
                className="px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
