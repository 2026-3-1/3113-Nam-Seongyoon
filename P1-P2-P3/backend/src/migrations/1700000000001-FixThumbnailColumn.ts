import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixThumbnailColumn1700000000001 implements MigrationInterface {
  name = 'FixThumbnailColumn1700000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`courses\` MODIFY COLUMN \`thumbnail\` TEXT NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`courses\` MODIFY COLUMN \`thumbnail\` VARCHAR(255) NOT NULL`,
    );
  }
}
