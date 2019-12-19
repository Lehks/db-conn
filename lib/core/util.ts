import fs from 'fs';
import path from 'path';

namespace Util {
    export function makeClassNameFromTableName(tableName: string): string {
        return tableName;
    }

    export function pluralizeTableName(tableName: string): string {
        if (tableName.endsWith('s')) {
            return `${tableName}s`;
        } else {
            return tableName;
        }
    }

    export function singularizeTableName(tableName: string): string {
        if (tableName.endsWith('s')) {
            return tableName.substring(0, tableName.length - 1);
        } else {
            return tableName;
        }
    }

    export function makeGetterName(columnName: string): string {
        // first letter will be turned into upper case
        const processedName = `${columnName[0].toUpperCase()}${columnName.substring(1)}`;

        return `get${processedName}`;
    }

    export function makeSetterName(columnName: string): string {
        // first letter will be turned into upper case
        const processedName = `${columnName[0].toUpperCase()}${columnName.substring(1)}`;

        return `set${processedName}`;
    }

    export function toSnakeCase(str: string): string {
        return str.split(/(?=[A-Z])/).join('_').toLowerCase();
    }

    interface IContext {
        [key: string]: string;
    }

    export function configure(input: string, context: IContext) {
        let processed = input;

        for (const key in context) {
            if (key) {
                processed = processed.replace(new RegExp(`@${key}@`), context[key]);
            }
        }

        return processed;
    }

    export async function configureAndWrite(input: string, outDir: string, outName: string, context: IContext) {
        const configured = configure(input, context);
        await fs.promises.writeFile(path.join(outDir, outName), configured);
    }
}

export = Util;
