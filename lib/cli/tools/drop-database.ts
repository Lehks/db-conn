import fs from 'fs';
import path from 'path';
import fileNames from '../../core/file-names';
import MariaDBDriver from '../../core/mariadb-driver/mariadb-db-connection-driver';
import DBAccess from '../../runtime/db-access-wrapper';
import dbConnLogger from './db-conn-logger';
import DefinitionLoader from './definition-loader';
import logger from './logger';

namespace executor {
    async function loadSql(fileName: string): Promise<string> {
        return await fs.promises.readFile(fileName, 'utf-8');
    }

    async function getDropTableFiles(inputDir: string): Promise<{tables: string[], constraints: string[]}> {
        const files = await fs.promises.readdir(inputDir);
        const ret = {
            tables: [] as string[],
            constraints: [] as string[]
        };

        for (const file of files) {
            if (file.startsWith(fileNames.DROP_TABLE_PREFIX)) {
                ret.tables.push(file);
            }

            if (file.startsWith(fileNames.DROP_CONSTRAINT_PREFIX)) {
                ret.constraints.push(file);
            }
        }

        return ret;
    }

    export async function execute(databaseDefinition: string) {
        logger.info(`Dropping database from SQL generated from definition file '${databaseDefinition}'.`);
        let db: DBAccess.DatabaseConnection | undefined;
        let inTransaction = false;

        try {
            const inflatedDefinition = await DefinitionLoader.load(databaseDefinition);
            const sqlPath = inflatedDefinition.meta.sqlOutputDir;

            logger.info(`Loading SQL sources from: '${sqlPath}'.`);

            db = new DBAccess.DatabaseConnection(MariaDBDriver);
            await db.initialize({
                host: 'localhost',
                database: 'test',
                user: 'root',
                password: undefined
            });

            logger.info('Database connection data is: ');
            dbConnLogger.log(db, logger.info);

            await db.transaction(async conn => {
                inTransaction = true;
                const files = await getDropTableFiles(sqlPath);

                for (const fileName of files.constraints) {
                    logger.info(`Dropping constraint from file ${fileName}...`);
                    await conn.query(await loadSql(path.join(sqlPath, fileName)));
                    logger.info(`Constraint has been dropped.`);
                }

                for (const fileName of files.tables) {
                    logger.info(`Dropping table from file ${fileName}...`);
                    await conn.query(await loadSql(path.join(sqlPath, fileName)));
                    logger.info(`Table has been dropped.`);
                }
            });
            inTransaction = false;
        } catch (error) {
            logger.error(`An error occurred. `, error);

            if (inTransaction) {
                logger.info('The transaction that was responsible for the table creation has been rolled back.');
                logger.warn('Some RDBMS do not support rollback of DDL statements (e.g. MySQL), therefore, some '
                    + 'tables may not have been dropped.');
            }
        } finally {
            if (db && db.isInitialized) {
                await db.terminate();
            }
        }
    }
}

export = executor;
