import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstructorSubscriptions1700000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD COLUMN \`emailNotifications\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(`
      CREATE TABLE \`instructor_subscriptions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`subscriberId\` int NOT NULL,
        \`instructorId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_instructor_subscriptions\` (\`subscriberId\`, \`instructorId\`),
        CONSTRAINT \`FK_instructor_subs_subscriber\` FOREIGN KEY (\`subscriberId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_instructor_subs_instructor\` FOREIGN KEY (\`instructorId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`instructor_subscriptions\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`emailNotifications\``,
    );
  }
}
