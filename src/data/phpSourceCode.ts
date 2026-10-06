export interface PhpFileItem {
  path: string;
  category: 'config' | 'database' | 'repository' | 'api' | 'view' | 'schema' | 'composer';
  description: string;
  code: string;
}

export const phpProjectFiles: PhpFileItem[] = [
  {
    path: 'config/database.php',
    category: 'config',
    description: 'PHP 8.3 Database Configuration with dual driver support (PostgreSQL & MySQL) using readonly class and match expression.',
    code: `<?php
declare(strict_types=1);

namespace OpenMU\\Config;

use PDO;
use InvalidArgumentException;

/**
 * OpenMU Database Configuration (PHP 8.3)
 * Supports both PostgreSQL (OpenMU native EF Core) and MySQL engines.
 */
enum DatabaseDriver: string
{
    case PostgreSQL = 'pgsql';
    case MySQL = 'mysql';
}

final readonly class DatabaseConfig
{
    public function __construct(
        public DatabaseDriver $driver = DatabaseDriver::PostgreSQL,
        public string $host = '127.0.0.1',
        public int $port = 5432,
        public string $database = 'openmu',
        public string $username = 'openmu_user',
        public string $password = 'SecretMasterKey2026!',
        public string $charset = 'utf8mb4',
        public bool $ssl = false,
        public array $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_PERSISTENT         => true,
        ]
    ) {}

    /**
     * Build the PDO DSN string using PHP 8 match expression
     */
    public function getDsn(): string
    {
        return match ($this->driver) {
            DatabaseDriver::PostgreSQL => sprintf(
                'pgsql:host=%s;port=%d;dbname=%s;options=\'--client_encoding=UTF8\'',
                $this->host,
                $this->port,
                $this->database
            ),
            DatabaseDriver::MySQL => sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $this->host,
                $this->port,
                $this->database,
                $this->charset
            ),
        };
    }

    /**
     * Factory from environment variables or .env
     */
    public static function fromEnv(): self
    {
        $driverStr = strtolower(getenv('DB_DRIVER') ?: 'pgsql');
        $driver = match ($driverStr) {
            'pgsql', 'postgres', 'postgresql' => DatabaseDriver::PostgreSQL,
            'mysql', 'mariadb'                => DatabaseDriver::MySQL,
            default => throw new InvalidArgumentException("Unsupported DB driver: {$driverStr}"),
        };

        return new self(
            driver: $driver,
            host: getenv('DB_HOST') ?: ($driver === DatabaseDriver::PostgreSQL ? '127.0.0.1' : '127.0.0.1'),
            port: (int)(getenv('DB_PORT') ?: ($driver === DatabaseDriver::PostgreSQL ? 5432 : 3306)),
            database: getenv('DB_DATABASE') ?: 'openmu',
            username: getenv('DB_USERNAME') ?: 'openmu_user',
            password: getenv('DB_PASSWORD') ?: '',
            charset: getenv('DB_CHARSET') ?: 'utf8mb4',
            ssl: filter_var(getenv('DB_SSL'), FILTER_VALIDATE_BOOLEAN)
        );
    }
}
`,
  },
  {
    path: 'src/Database/Connection.php',
    category: 'database',
    description: 'Singleton PDO connection factory with error trapping and reconnection handling.',
    code: `<?php
declare(strict_types=1);

namespace OpenMU\\Database;

use OpenMU\\Config\\DatabaseConfig;
use PDO;
use PDOException;
use RuntimeException;

final class Connection
{
    private static ?PDO $instance = null;
    private static ?DatabaseConfig $config = null;

    public static function setConfig(DatabaseConfig $config): void
    {
        self::$config = $config;
        self::$instance = null; // Reset connection on new config
    }

    public static function get(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        self::$config ??= DatabaseConfig::fromEnv();

        try {
            self::$instance = new PDO(
                self::$config->getDsn(),
                self::$config->username,
                self::$config->password,
                self::$config->options
            );
            return self::$instance;
        } catch (PDOException $e) {
            error_log(sprintf('[OpenMU DB Error] Connection failed: %s', $e->getMessage()));
            throw new RuntimeException('Cannot connect to OpenMU database: ' . $e->getMessage(), 0, $e);
        }
    }
}
`,
  },
  {
    path: 'src/Repositories/AccountRepository.php',
    category: 'repository',
    description: 'Player account registration, verification, password hashing (BCrypt), and profile queries matching OpenMU schema.',
    code: `<?php
declare(strict_types=1);

namespace OpenMU\\Repositories;

use OpenMU\\Database\\Connection;
use PDO;
use RuntimeException;
use InvalidArgumentException;

final readonly class AccountRepository
{
    public function __construct(
        private PDO $db = Connection::get()
    ) {}

    /**
     * Check if an account login name already exists
     */
    public function exists(string $loginName): bool
    {
        $stmt = $this->db->prepare('SELECT 1 FROM "Account" WHERE LOWER("LoginName") = LOWER(:login) LIMIT 1');
        $stmt->execute([':login' => trim($loginName)]);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Register a new player account into OpenMU
     * Implements secure password hashing with PASSWORD_BCRYPT
     */
    public function register(string $loginName, string $plainPassword, string $email, string $securityCode = '123456'): array
    {
        $loginName = trim($loginName);
        if (strlen($loginName) < 4 || strlen($loginName) > 10) {
            throw new InvalidArgumentException('ชื่อไอดีต้องมีความยาว 4 - 10 ตัวอักษร');
        }

        if (strlen($plainPassword) < 6) {
            throw new InvalidArgumentException('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('รูปแบบอีเมลไม่ถูกต้อง');
        }

        if ($this->exists($loginName)) {
            throw new InvalidArgumentException('ชื่อไอดีนี้มีผู้ใช้งานแล้ว');
        }

        // OpenMU uses BCrypt / salted PBKDF2 for password hashing
        $passwordHash = password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $vaultZen = 5000000; // 5,000,000 Zen welcome bonus

        $sql = <<<SQL
            INSERT INTO "Account" 
            ("LoginName", "PasswordHash", "EMail", "SecurityCode", "VaultMoney", "State", "CreatedAt")
            VALUES (:login, :hash, :email, :secCode, :vaultZen, 0, NOW())
            RETURNING "Id"
        SQL;

        // Compatible with PostgreSQL RETURNING or MySQL lastInsertId
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':login'    => $loginName,
            ':hash'     => $passwordHash,
            ':email'    => $email,
            ':secCode'  => $securityCode,
            ':vaultZen' => $vaultZen,
        ]);

        $accountId = $this->db->lastInsertId() ?: $stmt->fetchColumn();

        return [
            'success'   => true,
            'accountId' => (int)$accountId,
            'loginName' => $loginName,
            'message'   => 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่อาณาจักร OpenMU'
        ];
    }

    /**
     * Authenticate player login
     */
    public function authenticate(string $loginName, string $password): ?array
    {
        $stmt = $this->db->prepare('SELECT "Id", "LoginName", "PasswordHash", "EMail", "VaultMoney", "State" FROM "Account" WHERE LOWER("LoginName") = LOWER(:login) LIMIT 1');
        $stmt->execute([':login' => trim($loginName)]);
        $account = $stmt->fetch();

        if (!$account || !password_verify($password, $account['PasswordHash'])) {
            return null;
        }

        unset($account['PasswordHash']);
        return $account;
    }
}
`,
  },
  {
    path: 'src/Repositories/CharacterRepository.php',
    category: 'repository',
    description: 'Player Character operations: Leaderboard rankings, Reset character (Lv.400 -> Lv.1 + stats), PK Clear, Warp/Unstuck.',
    code: `<?php
declare(strict_types=1);

namespace OpenMU\\Repositories;

use OpenMU\\Database\\Connection;
use PDO;
use RuntimeException;
use InvalidArgumentException;

final readonly class CharacterRepository
{
    public function __construct(
        private PDO $db = Connection::get()
    ) {}

    /**
     * Fetch Top Rankings (Characters ordered by Resets DESC, Level DESC, EXP DESC)
     */
    public function getTopRankings(int $limit = 50, ?string $className = null): array
    {
        $query = <<<SQL
            SELECT 
                c."Id",
                c."Name",
                c."CharacterClass",
                c."Level",
                c."Resets",
                c."MasterResets",
                c."Experience",
                c."PkLevel",
                c."PkCount",
                c."CurrentMap",
                g."Name" AS "GuildName",
                g."Score" AS "GuildScore"
            FROM "Character" c
            LEFT JOIN "GuildMember" gm ON gm."CharacterId" = c."Id"
            LEFT JOIN "Guild" g ON g."Id" = gm."GuildId"
            WHERE (:class IS NULL OR c."CharacterClass" = :class)
            ORDER BY c."Resets" DESC, c."Level" DESC, c."Experience" DESC
            LIMIT :limit
        SQL;

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':class', $className, $className ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Reset Character Feature (OpenMU Player Web Service)
     * Requirements: Character level 400 + 10,000,000 Zen fee
     */
    public function resetCharacter(int $characterId, int $accountId): array
    {
        $this->db->beginTransaction();

        try {
            // Fetch and lock character row
            $stmt = $this->db->prepare('SELECT "Id", "AccountId", "Name", "Level", "Resets", "Money", "CharacterClass" FROM "Character" WHERE "Id" = :id FOR UPDATE');
            $stmt->execute([':id' => $characterId]);
            $char = $stmt->fetch();

            if (!$char || (int)$char['AccountId'] !== $accountId) {
                throw new InvalidArgumentException('ไม่พบตัวละครหรือคุณไม่ใช่เจ้าของตัวละครนี้');
            }

            if ((int)$char['Level'] < 400) {
                throw new InvalidArgumentException(sprintf('ตัวละครต้องมีเลเวล 400 ขึ้นไป (ปัจจุบัน: เลเวล %d)', $char['Level']));
            }

            $zenCost = 10000000;
            if ((int)$char['Money'] < $zenCost) {
                throw new InvalidArgumentException('ค่าใช้จ่าย 10,000,000 Zen ไม่เพียงพอ');
            }

            $newResets = (int)$char['Resets'] + 1;
            $bonusPoints = 500; // Bonus points per reset

            // Update character to Level 1 and increment resets
            $updateStmt = $this->db->prepare(<<<SQL
                UPDATE "Character"
                SET "Level" = 1,
                    "Experience" = 0,
                    "Resets" = :resets,
                    "LevelUpPoints" = "LevelUpPoints" + :bonusPoints,
                    "Money" = "Money" - :cost
                WHERE "Id" = :id
            SQL);

            $updateStmt->execute([
                ':resets'      => $newResets,
                ':bonusPoints' => $bonusPoints,
                ':cost'        => $zenCost,
                ':id'          => $characterId,
            ]);

            $this->db->commit();

            return [
                'success'   => true,
                'resets'    => $newResets,
                'message'   => sprintf('รีเซ็ตตัวละคร %s สำเร็จ! เพิ่มขึ้นเป็น Reset %d พร้อมรับโบนัส 500 แต้ม', $char['Name'], $newResets)
            ];
        } catch (\\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * PK Clear Feature (ล้างหัวแดง / Murderer Status)
     * Cost: 5,000,000 Zen per PK kill
     */
    public function clearPk(int $characterId, int $accountId): array
    {
        $stmt = $this->db->prepare('SELECT "Id", "AccountId", "Name", "PkLevel", "PkCount", "Money" FROM "Character" WHERE "Id" = :id');
        $stmt->execute([':id' => $characterId]);
        $char = $stmt->fetch();

        if (!$char || (int)$char['AccountId'] !== $accountId) {
            throw new InvalidArgumentException('ไม่พบตัวละครนี้');
        }

        if ((int)$char['PkLevel'] <= 3) {
            throw new InvalidArgumentException('ตัวละครนี้ไม่ได้อยู่ในสถานะหัวแดง (PK Hero/Normal)');
        }

        $cost = 10000000;
        if ((int)$char['Money'] < $cost) {
            throw new InvalidArgumentException('ต้องใช้เงิน 10,000,000 Zen ในตัวละคร');
        }

        $update = $this->db->prepare('UPDATE "Character" SET "PkLevel" = 3, "PkCount" = 0, "Money" = "Money" - :cost WHERE "Id" = :id');
        $update->execute([':cost' => $cost, ':id' => $characterId]);

        return [
            'success' => true,
            'message' => sprintf('ล้างสถานะหัวแดงของ %s เรียบร้อยแล้ว (กลับสู่สถานะปกติ)', $char['Name'])
        ];
    }

    /**
     * Unstuck / Warp to Safezone (Lorencia 125, 125)
     */
    public function warpToSafezone(int $characterId, int $accountId, string $map = 'Lorencia'): array
    {
        $coords = match (strtolower($map)) {
            'noria'   => ['map' => 'Noria', 'x' => 175, 'y' => 110],
            'devias'  => ['map' => 'Devias', 'x' => 220, 'y' => 45],
            default   => ['map' => 'Lorencia', 'x' => 125, 'y' => 125],
        };

        $stmt = $this->db->prepare(<<<SQL
            UPDATE "Character"
            SET "CurrentMap" = :map,
                "PositionX" = :x,
                "PositionY" = :y
            WHERE "Id" = :id AND "AccountId" = :accId
        SQL);

        $stmt->execute([
            ':map'   => $coords['map'],
            ':x'     => $coords['x'],
            ':y'     => $coords['y'],
            ':id'    => $characterId,
            ':accId' => $accountId,
        ]);

        return [
            'success' => true,
            'message' => sprintf('วาปตัวละครกลับเมือง %s พิกัด [%d, %d] สำเร็จ!', $coords['map'], $coords['x'], $coords['y'])
        ];
    }
}
`,
  },
  {
    path: 'public/api/register.php',
    category: 'api',
    description: 'REST API Endpoint for Player Registration returning JSON response.',
    code: `<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../vendor/autoload.php';

use OpenMU\\Repositories\\AccountRepository;

try {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true, 512, JSON_THROW_ON_ERROR);

    $loginName = (string)($payload['username'] ?? '');
    $password  = (string)($payload['password'] ?? '');
    $email     = (string)($payload['email'] ?? '');
    $security  = (string)($payload['security_code'] ?? '123456');

    $repo = new AccountRepository();
    $result = $repo->register($loginName, $password, $email, $security);

    http_response_code(201);
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (\\InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

} catch (\\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'เกิดข้อผิดพลาดในการประมวลผลเซิร์ฟเวอร์: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
`,
  },
  {
    path: 'public/api/rankings.php',
    category: 'api',
    description: 'REST API Endpoint for fetching top ranked players with optional class filter.',
    code: `<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../vendor/autoload.php';

use OpenMU\\Repositories\\CharacterRepository;

try {
    $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT) ?: 25;
    $class = filter_input(INPUT_GET, 'class', FILTER_SANITIZE_SPECIAL_CHARS);

    $repo = new CharacterRepository();
    $rankings = $repo->getTopRankings($limit, $class ?: null);

    echo json_encode([
        'success'   => true,
        'total'     => count($rankings),
        'server'    => 'OpenMU Lorencia Classic Season 6',
        'rankings'  => $rankings,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (\\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
`,
  },
  {
    path: 'database/schema_postgres.sql',
    category: 'schema',
    description: 'PostgreSQL Relational Schema matching OpenMU Server database architecture.',
    code: `-- ====================================================================
-- OpenMU PostgreSQL Schema (Open-Source MMORPG Core Database)
-- Compatible with PostgreSQL 14 / 15 / 16 and PHP 8.3 PDO pgsql
-- ====================================================================

CREATE SCHEMA IF NOT EXISTS data;

-- 1. Account Table (Game Accounts & Vault)
CREATE TABLE IF NOT EXISTS "Account" (
    "Id" BIGSERIAL PRIMARY KEY,
    "LoginName" VARCHAR(20) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "SecurityCode" VARCHAR(10) NOT NULL DEFAULT '123456',
    "EMail" VARCHAR(120) NOT NULL,
    "VaultMoney" BIGINT NOT NULL DEFAULT 5000000,
    "VaultPassword" VARCHAR(20),
    "State" INT NOT NULL DEFAULT 0, -- 0: Normal, 1: Banned, 2: TempLock
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastLoginAt" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_account_login ON "Account" (LOWER("LoginName"));

-- 2. Character Table (Players, Stats, Resets)
CREATE TABLE IF NOT EXISTS "Character" (
    "Id" BIGSERIAL PRIMARY KEY,
    "AccountId" BIGINT NOT NULL REFERENCES "Account"("Id") ON DELETE CASCADE,
    "Name" VARCHAR(20) NOT NULL UNIQUE,
    "CharacterClass" VARCHAR(40) NOT NULL, -- Blade Knight, Soul Master, Muse Elf, etc.
    "Level" INT NOT NULL DEFAULT 1,
    "Resets" INT NOT NULL DEFAULT 0,
    "MasterResets" INT NOT NULL DEFAULT 0,
    "Experience" BIGINT NOT NULL DEFAULT 0,
    "LevelUpPoints" INT NOT NULL DEFAULT 0,
    "MasterPoints" INT NOT NULL DEFAULT 0,
    "Strength" INT NOT NULL DEFAULT 30,
    "Agility" INT NOT NULL DEFAULT 30,
    "Vitality" INT NOT NULL DEFAULT 25,
    "Energy" INT NOT NULL DEFAULT 20,
    "Leadership" INT NOT NULL DEFAULT 0,
    "Money" BIGINT NOT NULL DEFAULT 1000000,
    "PkLevel" INT NOT NULL DEFAULT 3, -- 3: Normal, 4: Warning, 5: Murderer1, 6: Murderer2
    "PkCount" INT NOT NULL DEFAULT 0,
    "CurrentMap" VARCHAR(50) NOT NULL DEFAULT 'Lorencia',
    "PositionX" SMALLINT NOT NULL DEFAULT 125,
    "PositionY" SMALLINT NOT NULL DEFAULT 125,
    "State" INT NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_character_ranking ON "Character" ("Resets" DESC, "Level" DESC, "Experience" DESC);
CREATE INDEX IF NOT EXISTS idx_character_account ON "Character" ("AccountId");

-- 3. Guild & Members
CREATE TABLE IF NOT EXISTS "Guild" (
    "Id" BIGSERIAL PRIMARY KEY,
    "Name" VARCHAR(20) NOT NULL UNIQUE,
    "MasterCharacterId" BIGINT NOT NULL REFERENCES "Character"("Id"),
    "Score" INT NOT NULL DEFAULT 0,
    "Notice" TEXT,
    "LogoData" BYTEA,
    "CastleOwner" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "GuildMember" (
    "GuildId" BIGINT NOT NULL REFERENCES "Guild"("Id") ON DELETE CASCADE,
    "CharacterId" BIGINT NOT NULL UNIQUE REFERENCES "Character"("Id") ON DELETE CASCADE,
    "Role" INT NOT NULL DEFAULT 0, -- 0: Member, 128: BattleMaster, 64: AssistMaster, 32: GuildMaster
    PRIMARY KEY ("GuildId", "CharacterId")
);

-- 4. Server Live Status
CREATE TABLE IF NOT EXISTS "ServerStatus" (
    "ServerId" INT PRIMARY KEY,
    "ServerName" VARCHAR(50) NOT NULL,
    "CurrentPlayers" INT NOT NULL DEFAULT 0,
    "MaxPlayers" INT NOT NULL DEFAULT 1500,
    "IsOnline" BOOLEAN NOT NULL DEFAULT TRUE,
    "LastHeartbeat" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`,
  },
  {
    path: 'database/schema_mysql.sql',
    category: 'schema',
    description: 'MySQL 8.x Relational Schema with UTF-8mb4 collation for OpenMU compatibility.',
    code: `-- ====================================================================
-- OpenMU MySQL 8.x Schema (Compatible with classic MU Web Portals)
-- Charset: utf8mb4_unicode_ci
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Account Table
CREATE TABLE IF NOT EXISTS \`Account\` (
    \`Id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`LoginName\` VARCHAR(20) NOT NULL UNIQUE,
    \`PasswordHash\` VARCHAR(255) NOT NULL,
    \`SecurityCode\` VARCHAR(10) NOT NULL DEFAULT '123456',
    \`EMail\` VARCHAR(120) NOT NULL,
    \`VaultMoney\` BIGINT NOT NULL DEFAULT 5000000,
    \`VaultPassword\` VARCHAR(20) NULL,
    \`State\` INT NOT NULL DEFAULT 0,
    \`CreatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`LastLoginAt\` DATETIME NULL,
    INDEX \`idx_login\` (\`LoginName\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Character Table
CREATE TABLE IF NOT EXISTS \`Character\` (
    \`Id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`AccountId\` BIGINT UNSIGNED NOT NULL,
    \`Name\` VARCHAR(20) NOT NULL UNIQUE,
    \`CharacterClass\` VARCHAR(40) NOT NULL,
    \`Level\` INT NOT NULL DEFAULT 1,
    \`Resets\` INT NOT NULL DEFAULT 0,
    \`MasterResets\` INT NOT NULL DEFAULT 0,
    \`Experience\` BIGINT NOT NULL DEFAULT 0,
    \`LevelUpPoints\` INT NOT NULL DEFAULT 0,
    \`MasterPoints\` INT NOT NULL DEFAULT 0,
    \`Strength\` INT NOT NULL DEFAULT 30,
    \`Agility\` INT NOT NULL DEFAULT 30,
    \`Vitality\` INT NOT NULL DEFAULT 25,
    \`Energy\` INT NOT NULL DEFAULT 20,
    \`Leadership\` INT NOT NULL DEFAULT 0,
    \`Money\` BIGINT NOT NULL DEFAULT 1000000,
    \`PkLevel\` INT NOT NULL DEFAULT 3,
    \`PkCount\` INT NOT NULL DEFAULT 0,
    \`CurrentMap\` VARCHAR(50) NOT NULL DEFAULT 'Lorencia',
    \`PositionX\` SMALLINT NOT NULL DEFAULT 125,
    \`PositionY\` SMALLINT NOT NULL DEFAULT 125,
    \`State\` INT NOT NULL DEFAULT 0,
    \`CreatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_rank\` (\`Resets\` DESC, \`Level\` DESC, \`Experience\` DESC),
    CONSTRAINT \`fk_char_account\` FOREIGN KEY (\`AccountId\`) REFERENCES \`Account\` (\`Id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Guild Table
CREATE TABLE IF NOT EXISTS \`Guild\` (
    \`Id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`Name\` VARCHAR(20) NOT NULL UNIQUE,
    \`MasterCharacterId\` BIGINT UNSIGNED NOT NULL,
    \`Score\` INT NOT NULL DEFAULT 0,
    \`Notice\` TEXT NULL,
    \`CastleOwner\` TINYINT(1) NOT NULL DEFAULT 0,
    \`CreatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`fk_guild_master\` FOREIGN KEY (\`MasterCharacterId\`) REFERENCES \`Character\` (\`Id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`,
  },
  {
    path: 'composer.json',
    category: 'composer',
    description: 'Composer configuration specifying PHP 8.3 requirement and PSR-4 autoloading.',
    code: `{
    "name": "openmu/player-web-portal",
    "description": "OpenMU MMORPG Player Web Portal and Dual-Database Backend (PostgreSQL & MySQL)",
    "type": "project",
    "license": "MIT",
    "require": {
        "php": ">=8.3.0",
        "ext-pdo": "*",
        "ext-json": "*"
    },
    "autoload": {
        "psr-4": {
            "OpenMU\\\\": "src/"
        }
    },
    "config": {
        "optimize-autoloader": true,
        "sort-packages": true
    }
}
`,
  },
  {
    path: 'public/index.php',
    category: 'view',
    description: 'Complete standalone PHP 8.3 Player Portal landing page script with live database integration.',
    code: `<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use OpenMU\\Config\\DatabaseConfig;
use OpenMU\\Config\\DatabaseDriver;
use OpenMU\\Database\\Connection;
use OpenMU\\Repositories\\CharacterRepository;

// Initialize config (Auto-detects PostgreSQL or MySQL)
$config = DatabaseConfig::fromEnv();
Connection::setConfig($config);

$charRepo = new CharacterRepository();
$topRankings = [];
$dbStatus = 'Connected';
$errorMessage = null;

try {
    $topRankings = $charRepo->getTopRankings(10);
} catch (\\Throwable $e) {
    $dbStatus = 'Offline / Standby';
    $errorMessage = $e->getMessage();
}

$pageTitle = 'OpenMU · Classic Lorencia Web Portal';
?>
<!DOCTYPE html>
<html lang="th" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #090a0f; color: #f1f5f9; }
        h1, h2, h3, .font-cinzel { font-family: 'Cinzel', serif; }
    </style>
</head>
<body class="min-h-screen">
    <!-- Top Navigation Bar -->
    <header class="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" class="font-cinzel text-xl font-bold tracking-wider text-amber-400">OPENMU LORENCIA</a>
            <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
                <a href="#rankings" class="hover:text-amber-400 transition-colors">อันดับผู้เล่น (Rankings)</a>
                <a href="#download" class="hover:text-amber-400 transition-colors">ดาวน์โหลด (Download)</a>
                <a href="#events" class="hover:text-amber-400 transition-colors">ตารางกิจกรรม (Events)</a>
            </nav>
            <div class="flex items-center gap-3">
                <span class="text-xs px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                    PHP 8.3 &bull; <?= htmlspecialchars($config->driver->value) ?>
                </span>
                <a href="/register.php" class="text-xs px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold transition-all">
                    สมัครสมาชิก
                </a>
            </div>
        </div>
    </header>

    <!-- Hero Banner -->
    <main class="max-w-7xl mx-auto px-6 py-12">
        <div class="text-center py-16">
            <p class="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Season 6 Episode 3 &bull; OpenMU Core</p>
            <h1 class="text-4xl md:text-6xl font-black text-neutral-100 mb-6 font-cinzel">มหากาพย์สงครามลอเรนเซีย</h1>
            <p class="text-neutral-400 max-w-2xl mx-auto text-base mb-8">
                เซิร์ฟเวอร์ OpenMU มาตรฐานสากล ขับเคลื่อนด้วยฐานข้อมูล <?= strtoupper($config->driver->value) ?> และระบบจัดการผู้เล่น PHP 8.3 เสถียร ไร้บอท ไร้โปร สมดุลทุกอาชีพ
            </p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="/register.php" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg transition-colors">
                    สร้างไอดีเล่นเกม
                </a>
                <a href="/download.php" class="px-6 py-3 bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 text-neutral-200 font-medium rounded-lg transition-colors">
                    ดาวน์โหลดตัวเกม (1.45 GB)
                </a>
            </div>
        </div>

        <!-- Top Rankings Table -->
        <section id="rankings" class="mt-16 bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold font-cinzel text-neutral-100">Top 10 Hall of Fame</h2>
                <span class="text-xs text-neutral-500">สถานะฐานข้อมูล: <?= $dbStatus ?></span>
            </div>

            <?php if (!empty($topRankings)): ?>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="text-neutral-500 border-b border-neutral-800">
                            <th class="py-3 px-4">#</th>
                            <th class="py-3 px-4">ชื่อตัวละคร</th>
                            <th class="py-3 px-4">อาชีพ</th>
                            <th class="py-3 px-4 text-center">เลเวล</th>
                            <th class="py-3 px-4 text-center">รีเซ็ต</th>
                            <th class="py-3 px-4">กิลด์</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-800/60 font-mono">
                        <?php foreach ($topRankings as $idx => $char): ?>
                        <tr class="hover:bg-neutral-800/30">
                            <td class="py-3 px-4 text-amber-400"><?= $idx + 1 ?></td>
                            <td class="py-3 px-4 font-sans font-semibold text-neutral-200"><?= htmlspecialchars($char['Name']) ?></td>
                            <td class="py-3 px-4 text-neutral-400"><?= htmlspecialchars($char['CharacterClass']) ?></td>
                            <td class="py-3 px-4 text-center text-amber-300"><?= (int)$char['Level'] ?></td>
                            <td class="py-3 px-4 text-center font-bold text-emerald-400"><?= (int)$char['Resets'] ?></td>
                            <td class="py-3 px-4 text-neutral-400 font-sans"><?= htmlspecialchars($char['GuildName'] ?? '-') ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <?php else: ?>
                <div class="p-8 text-center text-neutral-500">
                    ยังไม่มีข้อมูลอันดับ หรือกำลังเชื่อมต่อฐานข้อมูล...
                </div>
            <?php endif; ?>
        </section>
    </main>
</body>
</html>
`,
  },
];
