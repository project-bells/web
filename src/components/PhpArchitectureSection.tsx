import React, { useState } from 'react';
import { phpProjectFiles, PhpFileItem } from '../data/phpSourceCode';
import { DbEngine, DatabaseConnectionConfig } from '../types/openmu';
import JSZip from 'jszip';
import { 
  Database, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Server, 
  ShieldCheck, 
  FileCode, 
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PhpArchitectureSectionProps {
  selectedDb: DbEngine;
  onSelectDb: (engine: DbEngine) => void;
}

export const PhpArchitectureSection: React.FC<PhpArchitectureSectionProps> = ({
  selectedDb,
  onSelectDb,
}) => {
  const [selectedFile, setSelectedFile] = useState<PhpFileItem>(phpProjectFiles[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Connection tester state
  const [dbConfig, setDbConfig] = useState<DatabaseConnectionConfig>({
    engine: selectedDb,
    host: '127.0.0.1',
    port: selectedDb === 'postgresql' ? 5432 : 3306,
    database: 'openmu',
    username: selectedDb === 'postgresql' ? 'openmu_user' : 'root',
    password: 'SecretMasterKey2026!',
    charset: 'utf8mb4',
    ssl: false,
  });

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    latencyMs?: number;
    message?: string;
    dsn?: string;
  }>({ status: 'idle' });

  // Update port and user when engine switches
  const handleEngineChange = (engine: DbEngine) => {
    onSelectDb(engine);
    setDbConfig((prev) => ({
      ...prev,
      engine,
      port: engine === 'postgresql' ? 5432 : 3306,
      username: engine === 'postgresql' ? 'openmu_user' : 'root',
    }));
    setTestResult({ status: 'idle' });
  };

  // Test Connection
  const handleTestConnection = () => {
    setTestResult({ status: 'testing' });

    setTimeout(() => {
      const dsn = dbConfig.engine === 'postgresql'
        ? `pgsql:host=${dbConfig.host};port=${dbConfig.port};dbname=${dbConfig.database};options='--client_encoding=UTF8'`
        : `mysql:host=${dbConfig.host};port=${dbConfig.port};dbname=${dbConfig.database};charset=${dbConfig.charset}`;

      setTestResult({
        status: 'success',
        latencyMs: Math.floor(Math.random() * 15) + 8,
        dsn,
        message: `เชื่อมต่อสำเร็จ! PDO driver [${dbConfig.engine === 'postgresql' ? 'pdo_pgsql' : 'pdo_mysql'}] ตอบสนองเรียบร้อย ตรวจพบตาราง "Account", "Character", "Guild" ในฐานข้อมูล ${dbConfig.database}`,
      });
    }, 600);
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Download all files as a ZIP package
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all PHP project files
      phpProjectFiles.forEach((file) => {
        zip.file(file.path, file.code);
      });

      // Add README.md
      const readmeContent = `# OpenMU Player Web Portal (PHP 8.3 Backend)
อ้างอิงสถาปัตยกรรมระบบ OpenMU (https://github.com/MUnique/OpenMU)
รองรับการเชื่อมต่อฐานข้อมูลแบบ Dual-Driver (PostgreSQL และ MySQL)

## ข้อกำหนดระบบ (Requirements)
- PHP 8.3 หรือสูงกว่า (ext-pdo, ext-pdo_pgsql, ext-pdo_mysql, ext-json)
- PostgreSQL 14+ (แนะนำสำหรับ OpenMU) หรือ MySQL 8.0+
- Composer (สำหรับการโหลด PSR-4 Autoloader)
- เว็บเซิร์ฟเวอร์ Nginx หรือ Apache 2.4+

## วิธีการติดตั้งอย่างรวดเร็ว (Quick Start)

### 1. นำเข้าฐานข้อมูล (Database Schema)
- หากใช้ **PostgreSQL**:
  \`\`\`bash
  psql -U postgres -d openmu -f database/schema_postgres.sql
  \`\`\`
- หากใช้ **MySQL**:
  \`\`\`bash
  mysql -u root -p openmu < database/schema_mysql.sql
  \`\`\`

### 2. กำหนดค่าตัวแปรสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์หรือตั้งค่า ENV ในเซิร์ฟเวอร์:
\`\`\`env
DB_DRIVER=pgsql       # หรือ mysql
DB_HOST=127.0.0.1
DB_PORT=5432          # 5432 สำหรับ pgsql, 3306 สำหรับ mysql
DB_DATABASE=openmu
DB_USERNAME=openmu_user
DB_PASSWORD=your_password
\`\`\`

### 3. ติดตั้ง Dependencies ด้วย Composer
\`\`\`bash
composer install
\`\`\`

### 4. รัน PHP Built-in Server ทดสอบในเครื่อง
\`\`\`bash
php -S 127.0.0.1:8000 -t public
\`\`\`
เปิดเบราว์เซอร์ไปที่: http://127.0.0.1:8000
`;
      zip.file('README.md', readmeContent);

      // Add Docker Compose for 1-click startup
      const dockerCompose = `version: '3.8'

services:
  web:
    image: php:8.3-fpm-alpine
    container_name: openmu-web
    working_dir: /var/www/html
    volumes:
      - ./:/var/www/html
    environment:
      - DB_DRIVER=\${DB_DRIVER:-pgsql}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=openmu
      - DB_USERNAME=openmu_user
      - DB_PASSWORD=openmu_secret
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    container_name: openmu-postgres
    environment:
      POSTGRES_DB: openmu
      POSTGRES_USER: openmu_user
      POSTGRES_PASSWORD: openmu_secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/schema_postgres.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  pgdata:
`;
      zip.file('docker-compose.yml', dockerCompose);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'openmu-player-web-php8.3.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <section id="php-architecture" className="py-20 border-b border-neutral-800 bg-[#07080c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              PHP 8.3 & Dual Database Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-neutral-100 flex items-center gap-3">
              <Database className="w-7 h-7 text-amber-400" />
              สถาปัตยกรรม PHP 8.3 & การเชื่อมต่อ DB
            </h2>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-neutral-950" />
              {isZipping ? 'กำลังสร้างไฟล์ ZIP...' : 'ดาวน์โหลดโปรเจกต์ PHP 8.3 (.ZIP)'}
            </button>
          </div>
        </div>

        {/* Database Selector & Interactive Connection Tester Box */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
            <div>
              <h3 className="text-lg font-bold font-cinzel text-neutral-100 flex items-center gap-2 mb-1">
                <Server className="w-5 h-5 text-amber-400" />
                ตั้งค่าเครื่องยนต์ฐานข้อมูล (Database Engine Switcher)
              </h3>
              <p className="text-xs text-neutral-400">
                สลับระหว่าง <strong>PostgreSQL</strong> (ฐานข้อมูลหลักของ OpenMU Core) และ <strong>MySQL</strong> (สำหรับเว็บ MU Classic)
              </p>
            </div>

            {/* Engine Tabs */}
            <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => handleEngineChange('postgresql')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                  selectedDb === 'postgresql'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>🐘 PostgreSQL 16</span>
                <span className="text-[10px] opacity-75 font-sans">(OpenMU Native)</span>
              </button>
              <button
                onClick={() => handleEngineChange('mysql')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                  selectedDb === 'mysql'
                    ? 'bg-amber-600 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>🐬 MySQL 8.x</span>
                <span className="text-[10px] opacity-75 font-sans">(Classic Port)</span>
              </button>
            </div>
          </div>

          {/* Connection Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6 text-xs">
            <div>
              <label className="text-neutral-400 block mb-1.5 font-mono">Host / IP</label>
              <input
                type="text"
                value={dbConfig.host}
                onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1.5 font-mono">Port</label>
              <input
                type="number"
                value={dbConfig.port}
                onChange={(e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1.5 font-mono">Database Name</label>
              <input
                type="text"
                value={dbConfig.database}
                onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1.5 font-mono">Username</label>
              <input
                type="text"
                value={dbConfig.username}
                onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleTestConnection}
                disabled={testResult.status === 'testing'}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-mono font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                {testResult.status === 'testing' ? 'กำลังเชื่อมต่อ...' : 'ทดสอบ PDO Connection'}
              </button>
            </div>
          </div>

          {/* Connection Test Result Box */}
          {testResult.status !== 'idle' && (
            <div
              className={`p-4 rounded-xl text-xs font-mono border transition-all ${
                testResult.status === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ผลการจำลองการเชื่อมต่อ PHP 8.3 PDO
                </span>
                {testResult.latencyMs && (
                  <span className="text-emerald-400 font-bold">Latency: {testResult.latencyMs} ms</span>
                )}
              </div>
              <p className="mb-2 font-sans text-neutral-300">{testResult.message}</p>
              {testResult.dsn && (
                <div className="bg-neutral-950/90 p-2.5 rounded-lg border border-neutral-800 text-neutral-400 overflow-x-auto text-[11px]">
                  <span className="text-neutral-500 select-none">PDO DSN: </span>
                  <code className="text-amber-300">{testResult.dsn}</code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Inspector: Tabs & Syntax Highlighting */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Bar with file list tabs */}
          <div className="bg-neutral-950 border-b border-neutral-800 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {phpProjectFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {file.path}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกโค้ด</span>
                </>
              )}
            </button>
          </div>

          {/* File description banner */}
          <div className="bg-neutral-900/80 px-6 py-2.5 border-b border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
            <span>{selectedFile.description}</span>
            <span className="font-mono text-neutral-500 text-[11px]">{selectedFile.path}</span>
          </div>

          {/* Code Viewer */}
          <div className="p-6 bg-neutral-950 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed">
            <pre className="text-neutral-300">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>

        {/* Architecture Mapping Comparison Table */}
        <div className="mt-12 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-bold font-cinzel text-neutral-100 mb-2 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            การแมปสถาปัตยกรรม OpenMU (C# .NET Core) สู่ PHP 8.3
          </h3>
          <p className="text-xs text-neutral-400 mb-6">
            เปรียบเทียบการทำงานของระบบเดิมบน OpenMU repository กับการอิมพลีเมนต์บน PHP 8.3 สำหรับระบบผู้เล่น
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase">
                  <th className="py-3 px-4">ฟีเจอร์ / โมดูล</th>
                  <th className="py-3 px-4">OpenMU Core (C# / EF Core)</th>
                  <th className="py-3 px-4">การทำงานบน PHP 8.3 (โปรเจกต์นี้)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-amber-400">Database Engine</td>
                  <td className="py-3 px-4">PostgreSQL via Npgsql / EntityFrameworkCore</td>
                  <td className="py-3 px-4 text-emerald-400">Dual PDO (PostgreSQL + MySQL 8.x) พร้อม match() expression</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-amber-400">Password Hashing</td>
                  <td className="py-3 px-4">BCrypt / Salted PBKDF2</td>
                  <td className="py-3 px-4 text-emerald-400">password_hash(..., PASSWORD_BCRYPT, ['cost' =&gt; 12])</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-amber-400">Character Reset</td>
                  <td className="py-3 px-4">GameContext.Characters.Update (Lv.400 check)</td>
                  <td className="py-3 px-4 text-emerald-400">PDO Transaction + FOR UPDATE row lock + Bonus Points 500</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-amber-400">PK Clear Status</td>
                  <td className="py-3 px-4">Character.PkLevel = 3, PkCount = 0</td>
                  <td className="py-3 px-4 text-emerald-400">CharacterRepository::clearPk() หักเงิน Zen 10M อัตโนมัติ</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-amber-400">Character Warp / Unstuck</td>
                  <td className="py-3 px-4">WarpCommand (Lorencia 125, 125)</td>
                  <td className="py-3 px-4 text-emerald-400">CharacterRepository::warpToSafezone() รีเซ็ตพิกัดและแมพ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
