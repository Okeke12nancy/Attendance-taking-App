import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTokenColumnNullable1721744025926
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "token" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "token" SET NOT NULL`
    );
  }
}
