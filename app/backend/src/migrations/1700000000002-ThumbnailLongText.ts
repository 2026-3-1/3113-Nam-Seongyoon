import { MigrationInterface, QueryRunner } from 'typeorm';

export class ThumbnailLongText1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`courses\` MODIFY COLUMN \`thumbnail\` LONGTEXT NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`courses\` MODIFY COLUMN \`thumbnail\` TEXT NOT NULL`,
    );
  }
}
