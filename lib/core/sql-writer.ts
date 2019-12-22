import fs from 'fs';
import path from 'path';
import logger from '../cli/tools/logger';
import fileNames from './file-names';
import SQLGenerator from './sql-generator';

namespace sqlWriter {
    export async function write(outDir: string, sql: SQLGenerator.IGeneratedSQL) {
        await fs.promises.mkdir(outDir, {recursive: true});

        for (const tableName in sql.create.tables) {
            if (tableName) {
                const filePath = path.join(outDir, fileNames.getCreateTableFileName(tableName));

                await fs.promises.writeFile(filePath, sql.create.tables[tableName]);
            }
        }

        for (const constraintName in sql.create.constraints.foreignKeys) {
            if (constraintName) {
                const filePath = path.join(outDir, fileNames.getCreateConstraintFileName(constraintName));

                await fs.promises.writeFile(filePath, sql.create.constraints.foreignKeys[constraintName]);
            }
        }

        for (const tableName in sql.drop.tables) {
            if (tableName) {
                const filePath = path.join(outDir, fileNames.getDropTableFileName(tableName));

                await fs.promises.writeFile(filePath, sql.drop.tables[tableName]);
            }
        }

        for (const constraintName in sql.drop.constraints.foreignKeys) {
            if (constraintName) {
                const filePath = path.join(outDir, fileNames.getDropConstraintFileName(constraintName));

                await fs.promises.writeFile(filePath, sql.drop.constraints.foreignKeys[constraintName]);
            }
        }
    }

    export function log(sql: SQLGenerator.IGeneratedSQL) {
        for (const tableName in sql.create.tables) {
            if (tableName) {
                logger.debug(`Create table ${tableName}`);
                logMultiline(sql.create.tables[tableName]);
            }
        }

        for (const constraintName in sql.create.constraints.foreignKeys) {
            if (constraintName) {
                logger.debug(`Create foreign key ${constraintName}`);
                logMultiline(sql.create.constraints.foreignKeys[constraintName]);
            }
        }

        for (const tableName in sql.drop.tables) {
            if (tableName) {
                logger.debug(`Drop table ${tableName}`);
                logMultiline(sql.drop.tables[tableName]);
            }
        }

        for (const constraintName in sql.drop.constraints) {
            if (constraintName) {
                logger.debug(`Drop foreign key ${constraintName}`);
                logMultiline(sql.drop.constraints.foreignKeys[constraintName]);
            }
        }
    }

    function logMultiline(str: string) {
        str.split('\n').forEach(l => logger.debug(l));
    }
}

export = sqlWriter;
