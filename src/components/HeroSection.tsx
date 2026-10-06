import React from 'react';
import { ServerInfo } from '../types/openmu';
import { Sparkles, Download, Code2, Users, ShieldCheck, Flame, Clock } from 'lucide-react';
import heroBannerImg from '../assets/images/hero_muonline_battle_1791269642577.jpg';

interface HeroSectionProps {
  serverInfo: ServerInfo;
  onOpenRegister: () => void;
  onOpenPhpSection: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  serverInfo,
  onOpenRegister,
  onOpenPhpSection,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800">
      {/* Background Graphic with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBannerImg}
          alt="OpenMU Continental Battle"
          className="w-full h-full object-cover object-center opacity-35 filter brightness-90 contrast-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#090a0f]/60 to-[#090a0f]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-3xl">
          {/* Version & Architecture Tag (Clean unboxed metadata) */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-4 tracking-wide uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {serverInfo.season}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono">PHP 8.3 PDO Backend</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-sky-400 font-mono">PostgreSQL & MySQL Ready</span>
          </div>

          {/* Marquee Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-100 tracking-tight font-cinzel leading-tight mb-6">
            มหากาพย์สงครามลอเรนเซีย <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              RETURN TO OPENMU
            </span>
          </h1>

          {/* Value Proposition */}
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 max-w-2xl font-sans">
            ระบบเว็บพอร์ทัลผู้เล่น MMORPG อ้างอิงสถาปัตยกรรม OpenMU Core พัฒนาด้วย <strong>PHP 8.3</strong> และเชื่อมต่อฐานข้อมูลแบบ Dual-Driver (PostgreSQL / MySQL) 
            รองรับระบบสมัครสมาชิก, รีเซ็ตเลเวล, ล้างหัวแดง, วาปตัวละคร และจัดอันดับแบบ Real-time
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-sm rounded-lg shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              สร้างไอดีเล่นเกมฟรี
            </button>

            <a
              href="#downloads"
              className="px-6 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 text-neutral-200 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-400" />
              ดาวน์โหลดตัวเกม (1.45 GB)
            </a>

            <button
              onClick={onOpenPhpSection}
              className="px-5 py-3.5 bg-neutral-950/80 hover:bg-neutral-900 border border-amber-500/30 text-amber-300 text-sm font-mono rounded-lg transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              ดูโค้ด PHP 8.3 & SQL
            </button>
          </div>
        </div>

        {/* Live Server Stat Ticker Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-6 border-t border-neutral-800/80 text-xs">
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-neutral-500 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              ผู้เล่นออนไลน์
            </div>
            <div className="font-mono text-base font-bold text-neutral-100 tabular-nums">
              {serverInfo.onlinePlayers} <span className="text-xs text-neutral-500 font-normal">/ {serverInfo.maxPlayers}</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-neutral-500 mb-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              อัตรา EXP
            </div>
            <div className="font-mono text-base font-bold text-amber-400 tabular-nums">
              {serverInfo.expRate} <span className="text-xs text-neutral-400">({serverInfo.masterExpRate})</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-neutral-500 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              อัตรา DROP
            </div>
            <div className="font-mono text-base font-bold text-emerald-400 tabular-nums">
              {serverInfo.dropRate}
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-neutral-500 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Chaos Machine
            </div>
            <div className="font-mono text-base font-bold text-sky-400 tabular-nums">
              {serverInfo.chaosMachineRate}
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-neutral-500 mb-1">กิลด์ทั้งหมด</div>
            <div className="font-mono text-base font-bold text-neutral-200 tabular-nums">
              {serverInfo.totalGuilds} <span className="text-xs text-neutral-500 font-normal">กิลด์</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-neutral-500 mb-1">สถานะระบบ</div>
            <div className="font-mono text-base font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {serverInfo.status}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
