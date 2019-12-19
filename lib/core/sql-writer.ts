import fs from 'fs';
import path from 'path';
import SQLGenerator from './sql-generator';

namespace sqlWriter {
    const CREATE_DATABASE_FILE_NAME = 'create-database.sql';
    const CREATE_TABLES_FILE_NAME = 'create-tables.sql';

    const DROP_DATABASE_FILE_NAME = 'drop-database.sql';
    const DROP_TABLES_FILE_NAME = 'drop-tables.sql';

    export async function write(outDir: string, sql: SQLGenerator.IGeneratedSQL) {
        await fs.promises.mkdir(outDir, {recursive: true});

        const CREATE_DATABASE = path.join(outDir, CREATE_DATABASE_FILE_NAME);
        const CREATE_TABLES = path.join(outDir, CREATE_TABLES_FILE_NAME);

        const DROP_DATABASE = path.join(outDir, DROP_DATABASE_FILE_NAME);
        const DROP_TABLES = path.join(outDir, DROP_TABLES_FILE_NAME);

        await fs.promises.writeFile(CREATE_DATABASE, sql.create.database);
        await fs.promises.writeFile(CREATE_TABLES, accumulateCreateTable(sql));

        await fs.promises.writeFile(DROP_DATABASE, sql.create.database);
        await fs.promises.writeFile(DROP_TABLES, accumulateDropTable(sql));
    }

    function accumulateCreateTable(sql: SQLGenerator.IGeneratedSQL) {
        let ret = '';

        ret += sql.create.tables.join('\n');
        ret += sql.create.constraints.foreignKeys.join('\n');

        return ret;
    }

    function accumulateDropTable(sql: SQLGenerator.IGeneratedSQL) {
        let ret = '';

        ret += sql.drop.tables.join('\n');

        return ret;
    }
}

export = sqlWriter;
