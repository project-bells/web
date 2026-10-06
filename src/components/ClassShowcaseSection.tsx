import React, { useState } from 'react';
import bkImg from '../assets/images/class_blade_knight_1791269655940.jpg';
import smImg from '../assets/images/class_soul_master_1791269667838.jpg';
import elfImg from '../assets/images/class_muse_elf_1791269678123.jpg';
import { Sword, Wand2, Target, Zap, Crown } from 'lucide-react';

interface ClassInfo {
  id: string;
  name: string;
  thaiName: string;
  role: string;
  image: string;
  description: string;
  keySkills: string[];
  startingStats: {
    str: number;
    agi: number;
    vit: number;
    ene: number;
    cmd?: number;
  };
  favoredWeapons: string[];
}

const classesData: ClassInfo[] = [
  {
    id: 'bk',
    name: 'Blade Knight (BK)',
    thaiName: 'เบลด ไนท์ (นักรบ)',
    role: 'Melee DPS / Tank / Combo Striker',
    image: bkImg,
    description: 'นักรบประจัญบานแห่งลอเรนเซีย พลังป้องกันและพลังชีวิตสูงที่สุดในเกม มีสกิลคอมโบ 3 จังหวะสร้างความเสียหายมหาศาล',
    keySkills: ['Twisting Slash', 'Rageful Blow', 'Death Stab', 'Greater Fortitude (บัฟเลือด)'],
    startingStats: { str: 28, agi: 20, vit: 25, ene: 10 },
    favoredWeapons: ['Dragon Spear', 'Knight Blade', 'Archangel Sword', 'Bone Blade'],
  },
  {
    id: 'sm',
    name: 'Soul Master (SM)',
    thaiName: 'โซล มาสเตอร์ (จอมเวท)',
    role: 'Ranged AoE Nuker / Crowd Control',
    image: smImg,
    description: 'จอมเวทผู้ควบคุมธาตุและพลังจักรวาล สามารถร่ายเวทมนตร์โจมตีเป็นวงกว้าง พร้อมสกิล Soul Barrier ลดดาเมจที่ได้รับอย่างมาก',
    keySkills: ['Hellfire', 'Evil Spirits', 'Ice Storm', 'Mana Shield (Soul Barrier)', 'Teleport'],
    startingStats: { str: 18, agi: 18, vit: 15, ene: 30 },
    favoredWeapons: ['Grand Soul Staff', 'Kundun Staff', 'Platina Wing Staff'],
  },
  {
    id: 'elf',
    name: 'Muse Elf (ELF)',
    thaiName: 'มิวส์ เอลฟ์ (นักธนู / เอลฟ์บัฟ)',
    role: 'Ranged Physical / Buffer / Healer',
    image: elfImg,
    description: 'เอลฟ์สาวแห่งดินแดนโนเรีย มีทั้งสาย Agility ยิงธนูระยะไกลด้วยความเร็วแสง และสาย Energy มอบบัฟโจมตี/ป้องกันและรักษาเพื่อนร่วมทีม',
    keySkills: ['Triple Shot', 'Penetration', 'Greater Damage (บัฟโจมตี)', 'Greater Defense (บัฟป้องกัน)', 'Heal'],
    startingStats: { str: 22, agi: 25, vit: 20, ene: 15 },
    favoredWeapons: ['Albatross Bow', 'Celestial Bow', 'Arrow Viper Bow'],
  },
  {
    id: 'mg',
    name: 'Magic Gladiator (MG)',
    thaiName: 'เมจิก กลาดิเอเตอร์ (นักรบเวท)',
    role: 'Hybrid Physical & Magic DPS',
    image: bkImg, // fallback with styled badge
    description: 'นักรบผู้ผสานพลังดาบและเวทมนตร์เข้าด้วยกัน ไม่มีหมวกเกราะแต่ได้แต้มเลเวลอัพ 7 แต้มต่อเลเวล วิ่งเร็วโดยไม่ต้องพึ่งพาปีก',
    keySkills: ['Power Slash', 'Fire Slash', 'Gigantic Storm', 'Flame Strike'],
    startingStats: { str: 26, agi: 26, vit: 26, ene: 26 },
    favoredWeapons: ['Rune Blade', 'Dark Reign Blade', 'Explosion Blade'],
  },
  {
    id: 'dl',
    name: 'Dark Lord (DL)',
    thaiName: 'ดาร์กลอร์ด (จอมทัพ)',
    role: 'Commander / Summoner / Heavy Burst',
    image: smImg, // fallback
    description: 'จอมทัพแห่งทวีปมู สามารถขี่ม้า Dark Horse และควบคุมนก Dark Raven มีค่าสเตตัส Command (ผู้นำ) สร้างความเสียหายไฟทะลวงเกราะ',
    keySkills: ['Fire Scream', 'Force Wave', 'Electric Spark', 'Earthquake', 'Critical Damage'],
    startingStats: { str: 26, agi: 20, vit: 20, ene: 15, cmd: 25 },
    favoredWeapons: ['Great Lord Scepter', 'Shining Scepter', 'Soleil Scepter'],
  },
];

export const ClassShowcaseSection: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>('bk');
  const selectedClass = classesData.find(c => c.id === selectedClassId) || classesData[0];

  return (
    <section id="classes" className="py-20 border-b border-neutral-800 bg-neutral-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-2">
              Character Classes & Progression
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-neutral-100">
              สายอาชีพแห่งทวีป MU
            </h2>
          </div>
          <p className="text-sm text-neutral-400 mt-2 md:mt-0 max-w-md">
            เลือกเส้นทางของคุณในตำนาน แต่ละอาชีพมีจุดเด่น รูปแบบสกิล และบทบาทในสงครามปราสาทที่สมดุลตามมาตรฐาน OpenMU
          </p>
        </div>

        {/* Class Selection Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-neutral-900/80 border border-neutral-800 rounded-xl">
          {classesData.map((cls) => {
            const isActive = cls.id === selectedClassId;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                {cls.id === 'bk' && <Sword className="w-3.5 h-3.5" />}
                {cls.id === 'sm' && <Wand2 className="w-3.5 h-3.5" />}
                {cls.id === 'elf' && <Target className="w-3.5 h-3.5" />}
                {cls.id === 'mg' && <Zap className="w-3.5 h-3.5" />}
                {cls.id === 'dl' && <Crown className="w-3.5 h-3.5" />}
                {cls.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Selected Class Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 overflow-hidden items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 relative group">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-neutral-700/60 relative bg-neutral-950">
              <img
                src={selectedClass.image}
                alt={selectedClass.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {selectedClass.role}
                </span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-neutral-100">
                  {selectedClass.name}
                </h3>
                <span className="text-sm text-neutral-400">({selectedClass.thaiName})</span>
              </div>

              <p className="text-neutral-300 text-sm leading-relaxed mb-6 font-sans">
                {selectedClass.description}
              </p>

              {/* Skills */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  สกิลสำคัญประจำอาชีพ (Key Skills)
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.keySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono"
                    >
                      ✦ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Starting Attributes Grid */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  สเตตัสเริ่มต้น (Base Attributes)
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 font-mono text-xs">
                  <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-center">
                    <span className="text-neutral-500 block text-[10px]">STR</span>
                    <span className="font-bold text-amber-400 text-sm">{selectedClass.startingStats.str}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-center">
                    <span className="text-neutral-500 block text-[10px]">AGI</span>
                    <span className="font-bold text-emerald-400 text-sm">{selectedClass.startingStats.agi}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-center">
                    <span className="text-neutral-500 block text-[10px]">VIT</span>
                    <span className="font-bold text-sky-400 text-sm">{selectedClass.startingStats.vit}</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-center">
                    <span className="text-neutral-500 block text-[10px]">ENE</span>
                    <span className="font-bold text-purple-400 text-sm">{selectedClass.startingStats.ene}</span>
                  </div>
                  {selectedClass.startingStats.cmd !== undefined && (
                    <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-center">
                      <span className="text-neutral-500 block text-[10px]">CMD</span>
                      <span className="font-bold text-amber-300 text-sm">{selectedClass.startingStats.cmd}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weapons */}
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  อาวุธยอดนิยม
                </div>
                <div className="text-xs text-neutral-300 font-sans">
                  {selectedClass.favoredWeapons.join(' · ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
