import DefinitionInflater from '../../core/definition-inflater';
import DefinitionListener from '../../core/definition-listener';
import DefinitionLoader from '../../core/definition-loader';
import DefinitionValidator from '../../core/definition-validator';
import DBSchema from '../../typings/database-definition-processed';
import logger from './logger';

namespace definitionLoader {
    export async function load(databaseDefinition: string, validate = false):
        Promise<DBSchema.DatabaseDefinitionSchema> {

        logger.info('Loading database definition...');
        const definition = await DefinitionLoader.loadAndValidate(databaseDefinition);
        logger.info('Definition has been loaded. JSON is valid according to JSON-schema.');

        logger.info('Inflating database definition...');
        await DefinitionListener.visit(new DefinitionInflater(), definition);
        logger.info('Inflated database definition.');

        if (validate) {
            logger.info('Semantically validating inflated definition.');
            await DefinitionListener.visit(new DefinitionValidator(), definition);
            logger.info('Semantic validation done.');
        }

        return definition as DBSchema.DatabaseDefinitionSchema;
    }
}

export = definitionLoader;
