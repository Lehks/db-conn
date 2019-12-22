import appRootDir from 'app-root-dir';
import fs from 'fs';
import path from 'path';
import GeneratorSchema from '../../typings/database-definition-sql-generator';
import SQLGenerator from '../sql-generator';
import Util from '../util';
import sqlTypeConverter from './sql-type-converter';

const TEMPLATE_BASE = path.join(appRootDir.get(), 'templates', 'sql');
const CREATE_TABLE = path.join(TEMPLATE_BASE, 'create-table.sql.in');
const TABLE_COLUMN = path.join(TEMPLATE_BASE, 'table-column.sql.in');
const PRIMARY_KEY = path.join(TEMPLATE_BASE, 'primary-key.sql.in');
const CREATE_FOREIGN_KEY = path.join(TEMPLATE_BASE, 'foreign-key.sql.in');

const DROP_TABLE = path.join(TEMPLATE_BASE, 'drop-table.sql.in');
const DROP_FOREIGN_KEY = path.join(TEMPLATE_BASE, 'drop-foreign-key.sql.in');

const TEMPLATE_CREATE_TABLE = fs.readFileSync(CREATE_TABLE, 'utf-8');
const TEMPLATE_TABLE_COLUMN = fs.readFileSync(TABLE_COLUMN, 'utf-8');
const TEMPLATE_PRIMARY_KEY = fs.readFileSync(PRIMARY_KEY, 'utf-8');
const TEMPLATE_CREATE_FOREIGN_KEY = fs.readFileSync(CREATE_FOREIGN_KEY, 'utf-8');

const TEMPLATE_DROP_TABLE = fs.readFileSync(DROP_TABLE, 'utf-8');
const TEMPLATE_DROP_FOREIGN_KEY = fs.readFileSync(DROP_FOREIGN_KEY, 'utf-8');

const createTable = (table: GeneratorSchema.Table) => {
    const columns: string[] = [];

    for (const columnName in table.columns) {
        if (columnName) {
            const column = table.columns[columnName];

            columns.push(Util.configure(TEMPLATE_TABLE_COLUMN, {
                columnName,
                dataType: sqlTypeConverter.makeTypeSQL(column.type),
                nullness: column.nullable ? '' : 'NOT NULL',
                uniqueness: column.unique ? 'UNIQUE' : '',
                default: column.type.default ? `DEFAULT ${sqlTypeConverter.makeDefault(column.type)}` : ''
            }));
        }
    }

    const keys = table.primaryKey.keys.join(', ');
    const primaryKey = Util.configure(TEMPLATE_PRIMARY_KEY, {
        keys
    });

    return Util.configure(TEMPLATE_CREATE_TABLE, {
        tableName: table.name,
        columns: columns.join(',\n    '),
        primaryKey
    });
};

const createForeignKey = (foreignKey: GeneratorSchema.ForeignKey) => Util.configure(TEMPLATE_CREATE_FOREIGN_KEY, {
    tableName: foreignKey.tableName,
    keyName: foreignKey.name,
    localColumn: foreignKey.on,
    foreignTable: foreignKey.references.table,
    foreignColumn: foreignKey.references.column,
    onUpdate: foreignKey.onUpdate,
    onDelete: foreignKey.onDelete
});

const dropTable = (table: GeneratorSchema.Table) => Util.configure(TEMPLATE_DROP_TABLE, {
    name: table.name
});

const dropForeignKey = (key: GeneratorSchema.ForeignKey) => Util.configure(TEMPLATE_DROP_FOREIGN_KEY, {
    tableName: key.tableName,
    name: key.name
});

const generator: SQLGenerator.ISQLGenerator = {
    createTable,
    createForeignKey,
    dropTable,
    dropForeignKey
};

export = generator;
