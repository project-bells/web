import React, { useState } from 'react';
import { AccountData, CharacterData, CharacterClass } from '../types/openmu';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  KeyRound, 
  RotateCcw, 
  ShieldAlert, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Coins, 
  Sparkles,
  Terminal,
  LogOut
} from 'lucide-react';

interface AccountPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: AccountData | null;
  onLogin: (account: AccountData) => void;
  onLogout: () => void;
  allAccounts: AccountData[];
  onRegisterAccount: (newAccount: AccountData) => void;
  onUpdateAccount: (updatedAccount: AccountData) => void;
  initialTab?: 'login' | 'register';
}

export const AccountPanelModal: React.FC<AccountPanelModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  onLogin,
  onLogout,
  allAccounts,
  onRegisterAccount,
  onUpdateAccount,
  initialTab = 'login',
}) => {
  const [modalTab, setModalTab] = useState<'login' | 'register'>(initialTab);
  const [selectedCharId, setSelectedCharId] = useState<string>('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSecurityCode, setRegSecurityCode] = useState('123456');
  const [regCharClass, setRegCharClass] = useState<CharacterClass>('Blade Knight');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Character Action Feedback & SQL Query display
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [executedQuery, setExecutedQuery] = useState<string>('');

  // Stat point allocation temporary state
  const [addStr, setAddStr] = useState(0);
  const [addAgi, setAddAgi] = useState(0);
  const [addVit, setAddVit] = useState(0);
  const [addEne, setAddEne] = useState(0);

  if (!isOpen) return null;

  // Active character
  const activeChar = currentAccount?.characters.find(c => c.id === selectedCharId) 
    || currentAccount?.characters[0] 
    || null;

  // Handle Login
  const handleDoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const found = allAccounts.find(
      (a) => a.loginName.toLowerCase() === loginUsername.trim().toLowerCase()
    );

    if (!found) {
      setLoginError('ไม่พบชื่อผู้ใช้งานนี้ กรุณาตรวจสอบหรือสมัครสมาชิกใหม่');
      return;
    }

    onLogin(found);
    if (found.characters.length > 0) {
      setSelectedCharId(found.characters[0].id);
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = () => {
    const demo = allAccounts[0];
    if (demo) {
      onLogin(demo);
      if (demo.characters.length > 0) {
        setSelectedCharId(demo.characters[0].id);
      }
    }
  };

  // Handle Register
  const handleDoRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const u = regUsername.trim();
    if (u.length < 4 || u.length > 10) {
      setRegError('ชื่อไอดีต้องมีความยาว 4 - 10 ตัวอักษร (ตามข้อกำหนด OpenMU)');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (!regEmail.includes('@')) {
      setRegError('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }

    const exists = allAccounts.some((a) => a.loginName.toLowerCase() === u.toLowerCase());
    if (exists) {
      setRegError('ชื่อไอดีนี้มีผู้ใช้งานแล้ว โปรดเลือกชื่ออื่น');
      return;
    }

    // Create new account
    const newChar: CharacterData = {
      id: `char-${Date.now()}`,
      name: `${u}_Hero`,
      characterClass: regCharClass,
      level: 1,
      resets: 0,
      masterResets: 0,
      experience: 0,
      levelUpPoints: 50,
      strength: 30,
      agility: 30,
      vitality: 25,
      energy: 20,
      leadership: regCharClass === 'Dark Lord' ? 25 : 0,
      zen: 5000000,
      pkLevel: 3,
      pkCount: 0,
      currentMap: 'Lorencia',
      positionX: 125,
      positionY: 125,
      isOnline: false,
    };

    const newAcc: AccountData = {
      id: `acc-${Date.now()}`,
      loginName: u,
      email: regEmail,
      vaultZen: 5000000,
      wCoins: 500,
      createdAt: new Date().toISOString().split('T')[0],
      characters: [newChar],
    };

    onRegisterAccount(newAcc);
    setRegSuccess('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
    setTimeout(() => {
      onLogin(newAcc);
      setSelectedCharId(newChar.id);
    }, 1000);
  };

  // Action: Reset Character
  const handleResetCharacter = () => {
    if (!currentAccount || !activeChar) return;

    if (activeChar.level < 400) {
      setActionFeedback(`❌ ตัวละครต้องมีเลเวล 400 ขึ้นไป (ปัจจุบัน: เลเวล ${activeChar.level})`);
      return;
    }

    const zenCost = 10000000;
    if (activeChar.zen < zenCost) {
      setActionFeedback('❌ ต้องการเงินในตัวละคร 10,000,000 Zen สำหรับค่าธรรมเนียมรีเซ็ต');
      return;
    }

    const newResets = activeChar.resets + 1;
    const bonusPoints = 500;

    const updatedChars = currentAccount.characters.map((c) => {
      if (c.id === activeChar.id) {
        return {
          ...c,
          level: 1,
          experience: 0,
          resets: newResets,
          levelUpPoints: c.levelUpPoints + bonusPoints,
          zen: c.zen - zenCost,
        };
      }
      return c;
    });

    const updatedAcc = { ...currentAccount, characters: updatedChars };
    onUpdateAccount(updatedAcc);

    setActionFeedback(`✅ รีเซ็ตตัวละคร ${activeChar.name} สำเร็จ! เพิ่มเป็น Reset ${newResets} พร้อมโบนัสสเตตัส +500 แต้ม`);
    setExecutedQuery(`-- PHP 8.3 PDO Query Executed:
UPDATE "Character"
SET "Level" = 1, "Experience" = 0, "Resets" = ${newResets},
    "LevelUpPoints" = "LevelUpPoints" + ${bonusPoints}, "Money" = "Money" - ${zenCost}
WHERE "Id" = '${activeChar.id}' AND "AccountId" = '${currentAccount.id}';`);
  };

  // Action: PK Clear
  const handlePkClear = () => {
    if (!currentAccount || !activeChar) return;

    if (activeChar.pkLevel <= 3 && activeChar.pkCount === 0) {
      setActionFeedback('ℹ️ ตัวละครนี้ไม่ได้อยู่ในสถานะหัวแดง (PK Hero/Normal อยู่แล้ว)');
      return;
    }

    const cost = 10000000;
    if (activeChar.zen < cost) {
      setActionFeedback('❌ ต้องการเงิน 10,000,000 Zen สำหรับล้างสถานะฆาตกร');
      return;
    }

    const updatedChars = currentAccount.characters.map((c) => {
      if (c.id === activeChar.id) {
        return {
          ...c,
          pkLevel: 3,
          pkCount: 0,
          zen: c.zen - cost,
        };
      }
      return c;
    });

    const updatedAcc = { ...currentAccount, characters: updatedChars };
    onUpdateAccount(updatedAcc);

    setActionFeedback(`✅ ล้างสถานะหัวแดงของ ${activeChar.name} เรียบร้อยแล้ว (กลับสู่สถานะพลเมืองปกติ)`);
    setExecutedQuery(`-- PHP 8.3 PDO Query Executed:
UPDATE "Character"
SET "PkLevel" = 3, "PkCount" = 0, "Money" = "Money" - ${cost}
WHERE "Id" = '${activeChar.id}' AND "AccountId" = '${currentAccount.id}';`);
  };

  // Action: Warp / Unstuck
  const handleWarpCharacter = (mapName: string) => {
    if (!currentAccount || !activeChar) return;

    let coords = { x: 125, y: 125 };
    if (mapName === 'Noria') coords = { x: 175, y: 110 };
    if (mapName === 'Devias') coords = { x: 220, y: 45 };

    const updatedChars = currentAccount.characters.map((c) => {
      if (c.id === activeChar.id) {
        return {
          ...c,
          currentMap: mapName,
          positionX: coords.x,
          positionY: coords.y,
        };
      }
      return c;
    });

    const updatedAcc = { ...currentAccount, characters: updatedChars };
    onUpdateAccount(updatedAcc);

    setActionFeedback(`✅ วาปตัวละคร ${activeChar.name} กลับสู่เมือง ${mapName} พิกัด [${coords.x}, ${coords.y}] สำเร็จ`);
    setExecutedQuery(`-- PHP 8.3 PDO Query Executed:
UPDATE "Character"
SET "CurrentMap" = '${mapName}', "PositionX" = ${coords.x}, "PositionY" = ${coords.y}
WHERE "Id" = '${activeChar.id}' AND "AccountId" = '${currentAccount.id}';`);
  };

  // Action: Allocate Stat Points
  const handleAllocateStats = () => {
    if (!currentAccount || !activeChar) return;
    const totalSpent = addStr + addAgi + addVit + addEne;

    if (totalSpent <= 0) {
      setActionFeedback('กรุณาใส่แต้มที่ต้องการเพิ่ม');
      return;
    }

    if (totalSpent > activeChar.levelUpPoints) {
      setActionFeedback(`❌ แต้มที่ต้องการอัพ (${totalSpent}) เกินกว่าแต้มคงเหลือ (${activeChar.levelUpPoints})`);
      return;
    }

    const updatedChars = currentAccount.characters.map((c) => {
      if (c.id === activeChar.id) {
        return {
          ...c,
          strength: c.strength + addStr,
          agility: c.agility + addAgi,
          vitality: c.vitality + addVit,
          energy: c.energy + addEne,
          levelUpPoints: c.levelUpPoints - totalSpent,
        };
      }
      return c;
    });

    const updatedAcc = { ...currentAccount, characters: updatedChars };
    onUpdateAccount(updatedAcc);

    setActionFeedback(`✅ เพิ่มสเตตัสสำเร็จ: STR +${addStr}, AGI +${addAgi}, VIT +${addVit}, ENE +${addEne}`);
    setExecutedQuery(`-- PHP 8.3 PDO Query Executed:
UPDATE "Character"
SET "Strength" = "Strength" + ${addStr},
    "Agility" = "Agility" + ${addAgi},
    "Vitality" = "Vitality" + ${addVit},
    "Energy" = "Energy" + ${addEne},
    "LevelUpPoints" = "LevelUpPoints" - ${totalSpent}
WHERE "Id" = '${activeChar.id}' AND "AccountId" = '${currentAccount.id}';`);

    setAddStr(0);
    setAddAgi(0);
    setAddVit(0);
    setAddEne(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0b0d14] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="font-cinzel text-lg font-bold text-neutral-100 tracking-wide">
              {currentAccount ? 'ระบบจัดการตัวละครและบัญชีผู้เล่น' : 'ระบบสมาชิก OpenMU Web Portal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {currentAccount ? (
            /* ================= LOGGED IN PLAYER DASHBOARD ================= */
            <div className="space-y-6">
              {/* Account Quick Header */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono">
                    {currentAccount.loginName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-100 flex items-center gap-2">
                      <span>{currentAccount.loginName}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Player Account
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      {currentAccount.email} &bull; สมาชิกตั้งแต่ {currentAccount.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">Vault Zen (คลัง)</span>
                    <span className="text-amber-400 font-bold">{currentAccount.vaultZen.toLocaleString()} Zen</span>
                  </div>
                  <div className="bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">WCoins</span>
                    <span className="text-emerald-400 font-bold">{currentAccount.wCoins.toLocaleString()} Pts</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Character Selector & Actions */}
              {activeChar && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Character List & Stats */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      เลือกตัวละครในไอดี:
                    </div>

                    <div className="space-y-2">
                      {currentAccount.characters.map((c) => {
                        const isSelected = c.id === activeChar.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCharId(c.id);
                              setActionFeedback('');
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/50 text-neutral-100'
                                : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm font-sans">{c.name}</div>
                              <div className="text-xs font-mono text-neutral-400">{c.characterClass}</div>
                            </div>
                            <div className="text-right text-xs font-mono">
                              <div className="text-amber-400 font-bold">Lv. {c.level}</div>
                              <div className="text-emerald-400">Resets: {c.resets}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Character Stats Card */}
                    <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 text-xs font-mono space-y-2.5">
                      <div className="text-neutral-400 font-semibold border-b border-neutral-800 pb-2 flex justify-between">
                        <span>ค่าสเตตัสปัจจุบัน:</span>
                        <span className="text-emerald-400">แต้มคงเหลือ: {activeChar.levelUpPoints}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-neutral-300">
                        <div className="flex justify-between bg-neutral-950 p-1.5 rounded">
                          <span className="text-neutral-500">Strength:</span>
                          <span className="font-bold text-amber-400">{activeChar.strength}</span>
                        </div>
                        <div className="flex justify-between bg-neutral-950 p-1.5 rounded">
                          <span className="text-neutral-500">Agility:</span>
                          <span className="font-bold text-emerald-400">{activeChar.agility}</span>
                        </div>
                        <div className="flex justify-between bg-neutral-950 p-1.5 rounded">
                          <span className="text-neutral-500">Vitality:</span>
                          <span className="font-bold text-sky-400">{activeChar.vitality}</span>
                        </div>
                        <div className="flex justify-between bg-neutral-950 p-1.5 rounded">
                          <span className="text-neutral-500">Energy:</span>
                          <span className="font-bold text-purple-400">{activeChar.energy}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-neutral-800/80 flex justify-between text-neutral-400">
                        <span>เงินในตัว:</span>
                        <span className="text-amber-300 font-bold">{activeChar.zen.toLocaleString()} Zen</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>แผนที่ปัจจุบัน:</span>
                        <span className="text-neutral-200">{activeChar.currentMap} [{activeChar.positionX}, {activeChar.positionY}]</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>สถานะ PK:</span>
                        <span className={activeChar.pkLevel > 3 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {activeChar.pkLevel > 3 ? `Murderer (ฆ่า ${activeChar.pkCount})` : 'Normal / Hero'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Web Services (Reset, PK Clear, Warp, Stat Points) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      บริการเว็บสำหรับตัวละคร (Character Web Services):
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Action 1: Reset Character */}
                      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-sm text-neutral-100 font-cinzel flex items-center gap-1.5">
                              <RotateCcw className="w-4 h-4 text-amber-400" />
                              รีเซ็ตเลเวล (Reset)
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono">Lv.400 + 10M Zen</span>
                          </div>
                          <p className="text-xs text-neutral-400 mb-3 font-sans leading-relaxed">
                            รีเซ็ตเลเวล 400 กลับสู่เลเวล 1 เพิ่มรอบรีเซ็ต +1 และรับโบนัสสเตตัส 500 แต้ม
                          </p>
                        </div>
                        <button
                          onClick={handleResetCharacter}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors"
                        >
                          ทำการรีเซ็ตตัวละคร
                        </button>
                      </div>

                      {/* Action 2: PK Clear */}
                      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-sm text-neutral-100 font-cinzel flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                              ล้างหัวแดง (PK Clear)
                            </span>
                            <span className="text-[10px] text-rose-400 font-mono">10M Zen</span>
                          </div>
                          <p className="text-xs text-neutral-400 mb-3 font-sans leading-relaxed">
                            ล้างสถานะฆาตกรหัวแดง กลับสู่สถานะพลเมืองปกติ สามารถซื้อขายไอเทมกับ NPC ได้ตามเดิม
                          </p>
                        </div>
                        <button
                          onClick={handlePkClear}
                          className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-lg transition-colors border border-neutral-700"
                        >
                          ล้างหัวแดง (Clear PK)
                        </button>
                      </div>

                      {/* Action 3: Warp to Safezone */}
                      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-neutral-100 font-cinzel flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-sky-400" />
                            วาปแก้ตัวละครติด (Unstuck / Warp)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">ฟรี (0 Zen)</span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-3 font-sans leading-relaxed">
                          กรณีตัวละครติดแมพ บัคพิกัด หรือออกจาก Blood Castle ไม่ได้ สามารถวาปกลับเมืองปลอดภัยได้ทันที
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleWarpCharacter('Lorencia')}
                            className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 rounded-lg font-mono transition-colors"
                          >
                            Lorencia [125, 125]
                          </button>
                          <button
                            onClick={() => handleWarpCharacter('Noria')}
                            className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 rounded-lg font-mono transition-colors"
                          >
                            Noria [175, 110]
                          </button>
                          <button
                            onClick={() => handleWarpCharacter('Devias')}
                            className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 rounded-lg font-mono transition-colors"
                          >
                            Devias [220, 45]
                          </button>
                        </div>
                      </div>

                      {/* Action 4: Add Stat Points Allocation */}
                      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-neutral-100 font-cinzel flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-emerald-400" />
                            อัพแต้มสเตตัสออนไลน์ (Add Stats)
                          </span>
                          <span className="text-xs font-mono text-emerald-400">
                            แต้มคงเหลือ: {activeChar.levelUpPoints}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono">
                          <div>
                            <label className="text-neutral-500 block mb-1">STR (+)</label>
                            <input
                              type="number"
                              min="0"
                              value={addStr}
                              onChange={(e) => setAddStr(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-neutral-500 block mb-1">AGI (+)</label>
                            <input
                              type="number"
                              min="0"
                              value={addAgi}
                              onChange={(e) => setAddAgi(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="text-neutral-500 block mb-1">VIT (+)</label>
                            <input
                              type="number"
                              min="0"
                              value={addVit}
                              onChange={(e) => setAddVit(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-sky-400"
                            />
                          </div>
                          <div>
                            <label className="text-neutral-500 block mb-1">ENE (+)</label>
                            <input
                              type="number"
                              min="0"
                              value={addEne}
                              onChange={(e) => setAddEne(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-purple-400"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleAllocateStats}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors font-mono"
                        >
                          บันทึกการเพิ่มสเตตัส (Update Points)
                        </button>
                      </div>
                    </div>

                    {/* Action Feedback Banner */}
                    {actionFeedback && (
                      <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200">
                        {actionFeedback}
                      </div>
                    )}

                    {/* Executed SQL query preview */}
                    {executedQuery && (
                      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] font-mono">
                        <div className="text-neutral-500 mb-1 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />
                          SQL Query ที่ PHP 8.3 ประมวลผลผ่าน PDO:
                        </div>
                        <pre className="text-amber-300 overflow-x-auto whitespace-pre-wrap">
                          {executedQuery}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= LOGIN & REGISTER TABS ================= */
            <div>
              {/* Tab Selector */}
              <div className="flex border-b border-neutral-800 mb-6">
                <button
                  onClick={() => {
                    setModalTab('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold font-cinzel transition-colors border-b-2 ${
                    modalTab === 'login'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  เข้าสู่ระบบ (Player Login)
                </button>
                <button
                  onClick={() => {
                    setModalTab('register');
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold font-cinzel transition-colors border-b-2 ${
                    modalTab === 'register'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  สมัครสมาชิกใหม่ (Register Account)
                </button>
              </div>

              {modalTab === 'login' ? (
                /* Login Form */
                <form onSubmit={handleDoLogin} className="space-y-4 max-w-md mx-auto py-4">
                  {loginError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1.5">ชื่อบัญชีผู้ใช้ (Username)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="เช่น KaiserAdmin"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1.5">รหัสผ่าน (Password)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all font-cinzel"
                  >
                    เข้าสู่ระบบ
                  </button>

                  {/* Quick Demo Login Option */}
                  <div className="pt-4 border-t border-neutral-800/80 text-center">
                    <span className="text-xs text-neutral-500 block mb-2">หรือทดสอบด้วยบัญชีตัวอย่าง OpenMU:</span>
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 text-xs font-mono rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      เข้าใช้งานด้วยไอดี Demo (KaiserAdmin - Blade Knight Lv.400)
                    </button>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleDoRegister} className="space-y-4 max-w-lg mx-auto py-2">
                  {regError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
                      {regError}
                    </div>
                  )}
                  {regSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {regSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1.5">ชื่อไอดี (4-10 ตัวอักษร)</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="เช่น DragonLord"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1.5">รหัสผ่าน (Password)</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="อย่างน้อย 6 ตัวอักษร"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1.5">อีเมล (EMail)</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="player@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1.5">รหัสลับลบตัวละคร (Security Code)</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={7}
                          value={regSecurityCode}
                          onChange={(e) => setRegSecurityCode(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1.5">อาชีพเริ่มต้นสำหรับตัวละครแรก:</label>
                    <select
                      value={regCharClass}
                      onChange={(e) => setRegCharClass(e.target.value as CharacterClass)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="Blade Knight">Blade Knight (นักรบประจัญบาน)</option>
                      <option value="Soul Master">Soul Master (จอมเวท)</option>
                      <option value="Muse Elf">Muse Elf (เอลฟ์นักธนู)</option>
                      <option value="Magic Gladiator">Magic Gladiator (นักรบเวท)</option>
                      <option value="Dark Lord">Dark Lord (จอมทัพ)</option>
                      <option value="Summoner">Summoner (ผู้อัญเชิญ)</option>
                      <option value="Rage Fighter">Rage Fighter (นักสู้หมัดหนัก)</option>
                    </select>
                  </div>

                  <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 font-mono">
                    <span className="text-amber-400 font-bold block mb-1">🎁 ของขวัญต้อนรับผู้เล่นใหม่:</span>
                    &bull; 5,000,000 Zen ในคลังส่วนตัว &bull; 500 WCoins &bull; แต้มเริ่มต้น 50 แต้ม
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all font-cinzel"
                  >
                    ยืนยันการสมัครสมาชิก (Create OpenMU Account)
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
