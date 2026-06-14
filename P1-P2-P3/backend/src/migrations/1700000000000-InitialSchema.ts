import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 초기 스키마 마이그레이션
 * 모든 테이블 및 인덱스를 생성합니다.
 * TypeORM synchronize: false 환경에서 실행됩니다.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\`               INT NOT NULL AUTO_INCREMENT,
        \`email\`            VARCHAR(255) NOT NULL,
        \`name\`             VARCHAR(255) NOT NULL,
        \`passwordHash\`     VARCHAR(255) NOT NULL,
        \`role\`             ENUM('STUDENT','TEACHER','ADMIN') NOT NULL DEFAULT 'STUDENT',
        \`isActive\`         TINYINT NOT NULL DEFAULT 1,
        \`refreshTokenHash\` TEXT NULL DEFAULT NULL,
        \`createdAt\`        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`user_profiles\` (
        \`id\`        INT NOT NULL AUTO_INCREMENT,
        \`bio\`       TEXT NULL,
        \`avatarUrl\` VARCHAR(255) NULL,
        \`userId\`    INT NOT NULL,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_user_profiles_userId\` (\`userId\`),
        CONSTRAINT \`FK_user_profiles_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`courses\` (
        \`id\`            INT NOT NULL AUTO_INCREMENT,
        \`title\`         VARCHAR(255) NOT NULL,
        \`category\`      VARCHAR(255) NOT NULL,
        \`description\`   TEXT NOT NULL,
        \`thumbnail\`     VARCHAR(255) NOT NULL,
        \`price\`         INT NOT NULL,
        \`originalPrice\` INT NULL,
        \`badge\`         VARCHAR(255) NOT NULL DEFAULT '인증 강사',
        \`duration\`      VARCHAR(255) NOT NULL DEFAULT '총 0강',
        \`tag\`           TEXT NULL,
        \`curriculum\`    TEXT NOT NULL DEFAULT '[]',
        \`isPublished\`   TINYINT NOT NULL DEFAULT 1,
        \`teacherId\`     INT NULL,
        \`createdAt\`     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_courses_category\`    (\`category\`),
        KEY \`IDX_courses_isPublished\` (\`isPublished\`),
        KEY \`IDX_courses_price\`       (\`price\`),
        KEY \`IDX_courses_teacherId\`   (\`teacherId\`),
        CONSTRAINT \`FK_courses_teacherId\` FOREIGN KEY (\`teacherId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`reviews\` (
        \`id\`        INT NOT NULL AUTO_INCREMENT,
        \`rating\`    INT NOT NULL,
        \`comment\`   TEXT NULL,
        \`userId\`    INT NOT NULL,
        \`courseId\`  INT NOT NULL,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_reviews_user_course\` (\`userId\`, \`courseId\`),
        KEY \`IDX_reviews_courseId\` (\`courseId\`),
        CONSTRAINT \`FK_reviews_userId\`   FOREIGN KEY (\`userId\`)   REFERENCES \`users\`   (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_reviews_courseId\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`cart_items\` (
        \`id\`        INT NOT NULL AUTO_INCREMENT,
        \`selected\`  TINYINT NOT NULL DEFAULT 1,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`userId\`    INT NOT NULL,
        \`courseId\`  INT NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_cart_user_course\` (\`userId\`, \`courseId\`),
        CONSTRAINT \`FK_cart_items_userId\`   FOREIGN KEY (\`userId\`)   REFERENCES \`users\`   (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_cart_items_courseId\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\`         INT NOT NULL AUTO_INCREMENT,
        \`totalPrice\` INT NOT NULL DEFAULT 0,
        \`status\`     VARCHAR(255) NOT NULL DEFAULT 'PAID',
        \`createdAt\`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`userId\`     INT NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_orders_userId\`    (\`userId\`),
        KEY \`IDX_orders_createdAt\` (\`createdAt\`),
        CONSTRAINT \`FK_orders_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\`       INT NOT NULL AUTO_INCREMENT,
        \`price\`    INT NOT NULL,
        \`orderId\`  INT NULL,
        \`courseId\` INT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_order_items_orderId\` (\`orderId\`),
        CONSTRAINT \`FK_order_items_orderId\`  FOREIGN KEY (\`orderId\`)  REFERENCES \`orders\`  (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_order_items_courseId\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\`              INT NOT NULL AUTO_INCREMENT,
        \`idempotencyKey\`  VARCHAR(255) NOT NULL,
        \`status\`          ENUM('PENDING','PAID','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
        \`amount\`          INT NOT NULL,
        \`pgTransactionId\` TEXT NULL,
        \`receiptUrl\`      TEXT NULL,
        \`failReason\`      TEXT NULL,
        \`createdAt\`       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`userId\`          INT NOT NULL,
        \`orderId\`         INT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_payments_idempotencyKey\` (\`idempotencyKey\`),
        KEY \`IDX_payments_userId\`  (\`userId\`),
        KEY \`IDX_payments_status\`  (\`status\`),
        CONSTRAINT \`FK_payments_userId\`  FOREIGN KEY (\`userId\`)  REFERENCES \`users\`  (\`id\`),
        CONSTRAINT \`FK_payments_orderId\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`course_progress\` (
        \`id\`              INT NOT NULL AUTO_INCREMENT,
        \`lessonIndex\`     INT NOT NULL DEFAULT 0,
        \`completedLessons\` TEXT NOT NULL DEFAULT '[]',
        \`lastWatchedAt\`   DATETIME NULL,
        \`userId\`          INT NOT NULL,
        \`courseId\`        INT NOT NULL,
        \`createdAt\`       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_progress_user_course\` (\`userId\`, \`courseId\`),
        CONSTRAINT \`FK_progress_userId\`   FOREIGN KEY (\`userId\`)   REFERENCES \`users\`   (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_progress_courseId\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`bookmarks\` (
        \`id\`        INT NOT NULL AUTO_INCREMENT,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`userId\`    INT NOT NULL,
        \`courseId\`  INT NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_bookmarks_user_course\` (\`userId\`, \`courseId\`),
        CONSTRAINT \`FK_bookmarks_userId\`   FOREIGN KEY (\`userId\`)   REFERENCES \`users\`   (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_bookmarks_courseId\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`job_logs\` (
        \`id\`         INT NOT NULL AUTO_INCREMENT,
        \`jobName\`    VARCHAR(255) NOT NULL,
        \`status\`     ENUM('SUCCESS','FAILED','SKIPPED') NOT NULL,
        \`message\`    TEXT NULL,
        \`durationMs\` INT NULL,
        \`createdAt\`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_job_logs_jobName\`   (\`jobName\`),
        KEY \`IDX_job_logs_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`job_logs\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`bookmarks\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`course_progress\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`payments\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`order_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`orders\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`cart_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`reviews\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`courses\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_profiles\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
