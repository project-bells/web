import React from 'react';
import { ExternalLink, Github, Database, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 py-12 text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-900">
          <div>
            <div className="text-amber-400 font-cinzel text-base font-bold tracking-wider mb-1">
              OPENMU · CONTINENT OF LORENCIA
            </div>
            <p className="text-neutral-400 max-w-md">
              ระบบแลนดิ้งเพจและเว็บพอร์ทัลผู้เล่น MMORPG พัฒนาด้วย PHP 8.3 เชื่อมต่อฐานข้อมูลคู่ PostgreSQL / MySQL 
              อ้างอิงมาตรฐาน OpenMU Core Web Services
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/MUnique/OpenMU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-mono"
            >
              <Github className="w-4 h-4" />
              <span>MUnique/OpenMU Core</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="#php-architecture"
              className="text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-mono"
            >
              <Database className="w-4 h-4" />
              <span>PHP 8.3 Architecture</span>
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} OpenMU Web Portal. Open-source emulator web services.
          </div>
          <div className="flex items-center gap-4">
            <span>PHP 8.3.x Strict Types</span>
            <span aria-hidden="true">&bull;</span>
            <span>PostgreSQL 16 & MySQL 8.0 PDO</span>
            <span aria-hidden="true">&bull;</span>
            <span>UTF-8mb4 Collation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
