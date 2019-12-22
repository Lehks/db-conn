import Ajv from 'ajv';
import appRootDir from 'app-root-dir';
import fs from 'fs';
import path from 'path';
import { DatabaseDefinitionSchema } from '../typings/database-definition';

namespace DefinitionLoader {
    const SCHEMA_PATH = path.join(appRootDir.get(), 'database-definition.schema.json');

    async function load(p: string): Promise<object> {
        return await import(path.resolve(p));
    }

    export async function loadAndValidate(p: string): Promise<DatabaseDefinitionSchema> {
        const rawSchema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        const ajv = new Ajv();
        const validate = ajv.compile(JSON.parse(rawSchema));
        const json = await load(p);

        const valid = await validate(json);
        delete (json as any).default; // remove default property which is added by ajv

        if (valid) {
            return json as DatabaseDefinitionSchema;
        } else {
            throw new ValidationError(validate.errors!);
        }
    }

    // for some reason, this can not be a member of class ValidationError
    function formatErrors(errors: Ajv.ErrorObject[]) {
        return errors.map(e => formatError(e)).join(';');
    }

    // for some reason, this can not be a member of class ValidationError
    function formatError(error: Ajv.ErrorObject): string {
        return `Validation failed with message: '${error.message}'. ` +
            `Constraint '${error.schemaPath}' failed for '${error.dataPath}'.`;
    }

    export class ValidationError extends Error {
        public readonly errors: Array<Ajv.ErrorObject & {fullMessage: string}>;

        public constructor(errors: Ajv.ErrorObject[]) {
            super();
            this.message = formatErrors(errors);
            this.errors = [];

            for (const error of errors) {
                this.errors.push({...error, fullMessage: ''});
                this.errors[this.errors.length - 1].fullMessage = formatError(error);
            }
        }
    }
}

export = DefinitionLoader;
