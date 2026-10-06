import React, { useState, useMemo } from 'react';
import { CharacterData, GuildData, DbEngine } from '../types/openmu';
import { Trophy, Search, Shield, Skull, Crown, ExternalLink } from 'lucide-react';

interface RankingsSectionProps {
  rankings: CharacterData[];
  guilds: GuildData[];
  selectedDb: DbEngine;
  onOpenPhpSection: () => void;
}

export const RankingsSection: React.FC<RankingsSectionProps> = ({
  rankings,
  guilds,
  selectedDb,
  onOpenPhpSection,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'guilds' | 'pk'>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Filtered characters
  const filteredCharacters = useMemo(() => {
    let list = [...rankings];

    if (activeTab === 'pk') {
      list.sort((a, b) => b.pkCount - a.pkCount);
    } else {
      list.sort((a, b) => {
        if (b.resets !== a.resets) return b.resets - a.resets;
        if (b.level !== a.level) return b.level - a.level;
        return b.experience - a.experience;
      });
    }

    if (selectedClassFilter !== 'ALL') {
      list = list.filter(c => c.characterClass.toLowerCase().includes(selectedClassFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.guildName && c.guildName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [rankings, activeTab, selectedClassFilter, searchQuery]);

  return (
    <section id="rankings" className="py-20 border-b border-neutral-800 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-2">
              Hall of Fame & Leaderboards
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-neutral-100 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-400" />
              ทำเนียบผู้กล้า (Rankings)
            </h2>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-mono">
              Driver: {selectedDb === 'postgresql' ? 'PostgreSQL PDO' : 'MySQL PDO'}
            </span>
            <button
              onClick={onOpenPhpSection}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>ดู PDO SQL Query</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Tab Controls & Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              onClick={() => setActiveTab('characters')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'characters'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              อันดับเลเวล & รีเซ็ต
            </button>
            <button
              onClick={() => setActiveTab('guilds')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'guilds'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              อันดับกิลด์ (Guilds)
            </button>
            <button
              onClick={() => setActiveTab('pk')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'pk'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              อันดับนักล่า (PK Killers)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อตัวละคร / กิลด์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Character Class Filter Pills (Only for Characters / PK tabs) */}
        {activeTab !== 'guilds' && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6 text-xs">
            {['ALL', 'Blade Knight', 'Soul Master', 'Muse Elf', 'Magic Gladiator', 'Dark Lord', 'Summoner', 'Rage Fighter'].map((c) => {
              const active = selectedClassFilter === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedClassFilter(c)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Table */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          {activeTab === 'guilds' ? (
            /* Guild Rankings Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-neutral-950/80 text-neutral-400 text-xs font-mono uppercase border-b border-neutral-800">
                    <th className="py-3.5 px-6">อันดับ</th>
                    <th className="py-3.5 px-6">ชื่อกิลด์</th>
                    <th className="py-3.5 px-6">หัวหน้ากิลด์ (Master)</th>
                    <th className="py-3.5 px-6 text-center">สมาชิก</th>
                    <th className="py-3.5 px-6 text-right">คะแนนกิลด์ (Score)</th>
                    <th className="py-3.5 px-6 text-center">สถานะปราสาท</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
                  {guilds.map((g, index) => (
                    <tr key={g.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-amber-400">
                        {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                      </td>
                      <td className="py-4 px-6 font-sans font-semibold text-neutral-100 flex items-center gap-2">
                        <span className="text-base">{g.logo}</span>
                        <span>{g.name}</span>
                      </td>
                      <td className="py-4 px-6 text-neutral-300">{g.masterName}</td>
                      <td className="py-4 px-6 text-center text-neutral-400 tabular-nums">{g.memberCount} / 30</td>
                      <td className="py-4 px-6 text-right font-bold text-amber-300 tabular-nums">
                        {g.score.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {g.castleOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            👑 เจ้าของปราสาท Loren
                          </span>
                        ) : (
                          <span className="text-neutral-500">ผู้ท้าชิง</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Character / PK Rankings Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-neutral-950/80 text-neutral-400 text-xs font-mono uppercase border-b border-neutral-800">
                    <th className="py-3.5 px-6">อันดับ</th>
                    <th className="py-3.5 px-6">ชื่อตัวละคร</th>
                    <th className="py-3.5 px-6">อาชีพ</th>
                    <th className="py-3.5 px-6 text-center">เลเวล</th>
                    <th className="py-3.5 px-6 text-center">รีเซ็ต (Resets)</th>
                    {activeTab === 'pk' ? (
                      <th className="py-3.5 px-6 text-center">จำนวนสังหาร (PK Kills)</th>
                    ) : (
                      <th className="py-3.5 px-6 text-center">Master Resets</th>
                    )}
                    <th className="py-3.5 px-6">กิลด์</th>
                    <th className="py-3.5 px-6 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
                  {filteredCharacters.length > 0 ? (
                    filteredCharacters.map((char, index) => (
                      <tr key={char.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-amber-400 tabular-nums">
                          {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                        </td>
                        <td className="py-4 px-6 font-sans font-semibold text-neutral-100">
                          {char.name}
                        </td>
                        <td className="py-4 px-6 text-neutral-300 font-sans">
                          {char.characterClass}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-amber-300 tabular-nums">
                          {char.level}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-emerald-400 tabular-nums">
                          {char.resets}
                        </td>
                        {activeTab === 'pk' ? (
                          <td className="py-4 px-6 text-center font-bold text-rose-400 tabular-nums">
                            {char.pkCount} Kills
                          </td>
                        ) : (
                          <td className="py-4 px-6 text-center text-sky-400 tabular-nums">
                            {char.masterResets}
                          </td>
                        )}
                        <td className="py-4 px-6 font-sans text-neutral-300 flex items-center gap-1.5">
                          {char.guildLogo && <span>{char.guildLogo}</span>}
                          <span>{char.guildName || '-'}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {char.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">Offline</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        ไม่พบข้อมูลตัวละครที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
