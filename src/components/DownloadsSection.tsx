import React from 'react';
import { Download, Monitor, HardDrive, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DownloadsSection: React.FC = () => {
  return (
    <section id="downloads" className="py-20 border-b border-neutral-800 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-2">
              Official Game Client & Patches
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-neutral-100 flex items-center gap-3">
              <Download className="w-7 h-7 text-amber-400" />
              ดาวน์โหลดตัวเกม
            </h2>
          </div>
          <p className="text-sm text-neutral-400 mt-2 md:mt-0 max-w-md">
            เลือกช่องทางดาวน์โหลดตัวเกมเต็มพร้อมเล่น หรือโปรแกรมอัปเดตอัตโนมัติ (Auto-Patcher) ปลอดภัยไร้ไวรัส 100%
          </p>
        </div>

        {/* Download Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Main Option: Full Game Client */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  แนะนำสำหรับผู้เล่นใหม่
                </span>
                <span className="text-xs font-mono text-neutral-500">เวอร์ชัน 6.3.0</span>
              </div>

              <h3 className="text-2xl font-bold font-cinzel text-neutral-100 mb-2">
                OpenMU Full Client (ตัวเกมเต็ม)
              </h3>
              <p className="text-sm text-neutral-300 mb-6 font-sans">
                ตัวเกมแบบสมบูรณ์ มีเสียง BGM ดนตรีประกอบ และ Sound FX ครบครัน ดาวน์โหลดเสร็จแตกไฟล์แล้วเข้าเล่นผ่าน Launcher ได้ทันที
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-xs font-mono">
                <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg">
                  <span className="text-neutral-500 block text-[10px]">ขนาดไฟล์</span>
                  <span className="text-neutral-200 font-bold">1.45 GB</span>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg">
                  <span className="text-neutral-500 block text-[10px]">รูปแบบ</span>
                  <span className="text-neutral-200 font-bold">.ZIP / .RAR</span>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-neutral-500 block text-[10px]">MD5 Checksum</span>
                  <span className="text-amber-400 font-mono truncate block">9f8a3c...e412</span>
                </div>
              </div>
            </div>

            {/* Mirrors */}
            <div>
              <div className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                ลิงก์ดาวน์โหลด (เลือก 1 ช่องทาง):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href="#direct-download"
                  onClick={(e) => { e.preventDefault(); alert('เริ่มดาวน์โหลด OpenMU_Season6_FullClient.zip จากเซิร์ฟเวอร์ความเร็วสูง (Direct Server)'); }}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs text-center transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Direct Link 1
                </a>
                <a
                  href="#gdrive"
                  onClick={(e) => { e.preventDefault(); alert('เปิดลิงก์ Google Drive Mirror เพื่อดาวน์โหลด'); }}
                  className="px-4 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium rounded-lg text-xs text-center transition-all"
                >
                  Google Drive
                </a>
                <a
                  href="#mega"
                  onClick={(e) => { e.preventDefault(); alert('เปิดลิงก์ MEGA.nz Mirror เพื่อดาวน์โหลด'); }}
                  className="px-4 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium rounded-lg text-xs text-center transition-all"
                >
                  MEGA Mirror
                </a>
              </div>
            </div>
          </div>

          {/* Option 2: Mini Auto-Patcher & System Requirements */}
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold font-cinzel text-neutral-100">
                  Auto-Update Launcher (18.4 MB)
                </h3>
                <span className="text-xs font-mono text-neutral-500">v1.2.4</span>
              </div>
              <p className="text-xs text-neutral-300 mb-4 font-sans leading-relaxed">
                สำหรับผู้เล่นที่มีตัวเกม MU Season 6 อยู่แล้ว สามารถดาวน์โหลดตัว Launcher นี้ไปวางในโฟลเดอร์เกมเพื่ออัปเดตไฟล์ล่าสุดอัตโนมัติ
              </p>
              <button
                onClick={() => alert('เริ่มดาวน์โหลด OpenMU_AutoLauncher.exe')}
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                ดาวน์โหลดเฉพาะ Launcher (.EXE)
              </button>
            </div>

            {/* System Requirements */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                ความต้องการของระบบ (System Requirements)
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-500">ระบบปฏิบัติการ (OS):</span>
                  <span className="text-neutral-300">Windows 7 / 8 / 10 / 11 (64-bit)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-500">หน่วยประมวลผล (CPU):</span>
                  <span className="text-neutral-300">Intel Core i3 2.0 GHz ขึ้นไป</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-500">แรม (RAM):</span>
                  <span className="text-neutral-300">4 GB RAM (แนะนำ 8 GB)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-500">การ์ดจอ (GPU):</span>
                  <span className="text-neutral-300">DirectX 9.0c Compatible</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">พื้นที่ฮาร์ดดิสก์ (HDD):</span>
                  <span className="text-neutral-300">5.0 GB Free Space</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Steps Installation Guide */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            ขั้นตอนการติดตั้งและเข้าเล่น
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <strong className="text-neutral-200 block mb-1">ดาวน์โหลดและแตกไฟล์</strong>
                <p className="text-neutral-400">ดาวน์โหลดตัวเกมแบบ Full Client แล้วทำการแตกไฟล์ด้วย WinRAR หรือ 7-Zip ลงในไดรฟ์ C: หรือ D:</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <strong className="text-neutral-200 block mb-1">เปิด Launcher ตรวจสอบไฟล์</strong>
                <p className="text-neutral-400">ดับเบิลคลิกไฟล์ OpenMU_Launcher.exe เพื่อให้โปรแกรมตรวจสอบและอัปเดตไฟล์แพทช์ล่าสุด</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <strong className="text-neutral-200 block mb-1">เข้าเกมด้วยไอดีที่คุณสมัคร</strong>
                <p className="text-neutral-400">กดปุ่ม "Start Game" แล้วใส่ชื่อบัญชีและรหัสผ่านที่คุณสร้างไว้บนหน้าเว็บนี้เพื่อผจญภัยได้ทันที</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
