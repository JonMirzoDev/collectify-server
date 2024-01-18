import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullTextSearch1705588269139 implements MigrationInterface {
  name = 'FullTextSearch1705588269139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "items" ADD "searchText" tsvector NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_962b6d5542f3eb513b89e4ecf8" ON "items" ("searchText") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_962b6d5542f3eb513b89e4ecf8"`,
    );
    await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "searchText"`);
  }
}
