import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateSubscriptionTables1764582730948 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
