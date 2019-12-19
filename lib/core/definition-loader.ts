import Ajv from 'ajv';
import appRootDir from 'app-root-dir';
import fs from 'fs';
import path from 'path';
import { DatabaseDefinitionSchema } from '../typings/database-definition';

namespace DefinitionLoader {
    const SCHEMA_PATH = path.join(appRootDir.get(), 'database-definition.schema.json');
    let schema: Ajv.ValidateFunction;

    async function load(p: string): Promise<object> {
        return await import(path.resolve(p));
    }

    async function loadSchema() {
        if (!schema) {
            const rawSchema = fs.readFileSync(SCHEMA_PATH);
            schema = new Ajv().compile(rawSchema);
        }
    }

    export async function loadAndValidate(p: string): Promise<DatabaseDefinitionSchema> {
        await loadSchema();
        const json = await load(p);

        const valid = schema(json);
        delete (json as any).default; // remove default property which is added by ajv

        if (valid) {
            return json as DatabaseDefinitionSchema;
        } else {
            throw null; // todo error handling
        }
    }
}

export = DefinitionLoader;
