import path from 'path';
import DefinitionInflater from '../core/definition-inflater';
import DefinitionListener from '../core/definition-listener';
import DefinitionLoader from '../core/definition-loader';
import DefinitionValidator from '../core/definition-validator';
import MariaDBGenerator from '../core/maraidb-generator/mariadb-sql-generator';
import SQLGenerator from '../core/sql-generator';
import SQLWriter from '../core/sql-writer';
import DBSchema from '../typings/database-definition-processed';
import logger from './logger';

namespace generator {
    export async function generate(databaseDefinition: string, dryRun: boolean) {
        logger.info(`Generating database SQL and JS client for definition file '${databaseDefinition}'.`);

        if (dryRun) {
            logger.info('Doing dry run.');
        }

        try {
            logger.info('Loading database definition...');
            const definition = await DefinitionLoader.loadAndValidate(databaseDefinition);
            logger.info('Definition has been loaded. JSON is valid according to JSON-schema.');

            logger.info('Inflating database definition...');
            await DefinitionListener.visit(new DefinitionInflater(), definition);
            logger.info('Inflated database definition.');

            logger.info('Semantically validating inflated definition.');
            await DefinitionListener.visit(new DefinitionValidator(), definition);
            logger.info('Semantic validation done.');

            logger.info(`JavaScript sources output directory is: '${definition.meta!.jsOutputDir}'.`);
            logger.info(`SQL sources output directory is: '${definition.meta!.sqlOutputDir}'.`);

            const inflatedDefinition = definition as DBSchema.DatabaseDefinitionSchema;

            if (!dryRun) {
                logger.info(`Generating SQL...`);
                const sql = SQLGenerator.generate(MariaDBGenerator, inflatedDefinition);
                logger.info(`Done generating SQL.`);

                const outDir = path.resolve(definition.meta!.sqlOutputDir!, path.dirname(databaseDefinition));

                logger.info(`Writing SQL...`);
                await SQLWriter.write(outDir, sql);
                logger.info(`Done writing SQL.`);
            } else {
                logger.info('Final, inflated database definition is:');
                logger.info(JSON.stringify(definition, null, 4));
            }
        } catch (error) {
            logger.error(`An error occurred.`, error);
        }
    }
}

export = generator;
