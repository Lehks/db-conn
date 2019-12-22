import path from 'path';
import MariaDBGenerator from '../../core/mariadb-driver/mariadb-sql-generator';
import SQLGenerator from '../../core/sql-generator';
import SQLWriter from '../../core/sql-writer';
import DefinitionLoader from './definition-loader';
import logger from './logger';

namespace generator {
    export async function generate(databaseDefinition: string, dryRun: boolean) {
        logger.info(`Generating database SQL and JS client for definition file '${databaseDefinition}'.`);

        if (dryRun) {
            logger.level = 'debug';
            logger.debug('Doing dry run.');
        }

        try {
            const inflatedDefinition = await DefinitionLoader.load(databaseDefinition, true);

            logger.info(`JavaScript sources output directory is: '${inflatedDefinition.meta.jsOutputDir}'.`);
            logger.info(`SQL sources output directory is: '${inflatedDefinition.meta.sqlOutputDir}'.`);

            logger.info(`Generating SQL...`);
            const sql = SQLGenerator.generate(MariaDBGenerator, inflatedDefinition);
            logger.info(`Done generating SQL.`);

            if (!dryRun) {
                const outDir = path.resolve(inflatedDefinition.meta.sqlOutputDir, path.dirname(databaseDefinition));

                logger.info(`Writing SQL...`);
                await SQLWriter.write(outDir, sql);
                logger.info(`Done writing SQL.`);
            } else {
                logger.debug('Final, inflated database definition is:');
                JSON.stringify(inflatedDefinition, null, 4).split('\n').forEach(l => logger.debug(l));

                logger.debug('Generated SQL is:');
                SQLWriter.log(sql);
            }
        } catch (error) {
            logger.error(`An error occurred. `, error);
        }
    }
}

export = generator;
