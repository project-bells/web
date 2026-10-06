import React, { useState, useEffect } from 'react';
import { initialEvents } from '../data/mockOpenMuData';
import { GameEvent } from '../types/openmu';
import { Timer, Gift, Swords, Shield, Sparkles } from 'lucide-react';

export const EventScheduleSection: React.FC = () => {
  const [events, setEvents] = useState<GameEvent[]>(initialEvents);

  // Synchronized countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.nextRunInSeconds <= 1) {
            return {
              ...e,
              nextRunInSeconds: e.intervalMinutes * 60,
            };
          }
          return {
            ...e,
            nextRunInSeconds: e.nextRunInSeconds - 1,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section id="events" className="py-20 border-b border-neutral-800 bg-neutral-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-2">
              Daily Battle Schedule & Invasions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-neutral-100 flex items-center gap-3">
              <Timer className="w-7 h-7 text-amber-400" />
              ตารางกิจกรรมและสงคราม
            </h2>
          </div>
          <p className="text-sm text-neutral-400 mt-2 md:mt-0 max-w-md">
            ระบบจับเวลานับถอยหลัง Real-time ประจำวัน ไม่พลาดทุกรอบ Blood Castle, Devil Square, Chaos Castle และการบุกรุกของมังกรทอง
          </p>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isImminent = evt.nextRunInSeconds < 300; // < 5 mins
            return (
              <div
                key={evt.id}
                className={`bg-neutral-900/60 border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  isImminent
                    ? 'border-amber-500/70 shadow-lg shadow-amber-500/10'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold font-cinzel text-neutral-100">
                        {evt.name}
                      </h3>
                      <div className="text-xs text-neutral-400 font-sans">
                        {evt.thaiName}
                      </div>
                    </div>
                    {/* Countdown Badge */}
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">
                        รอบถัดไป
                      </div>
                      <div
                        className={`font-mono text-base font-bold tabular-nums px-2.5 py-1 rounded ${
                          isImminent
                            ? 'bg-amber-500 text-neutral-950 animate-pulse'
                            : 'bg-neutral-950 border border-neutral-800 text-amber-400'
                        }`}
                      >
                        {formatCountdown(evt.nextRunInSeconds)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 mb-4 leading-relaxed font-sans">
                    {evt.description}
                  </p>

                  <div className="text-xs text-neutral-400 mb-4 font-mono">
                    <span className="text-neutral-500">ระดับที่รองรับ: </span>
                    <span className="text-neutral-200">{evt.recommendedLevel}</span>
                  </div>
                </div>

                {/* Rewards list */}
                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    รางวัลกิจกรรม
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evt.rewards.map((rw, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300"
                      >
                        {rw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
