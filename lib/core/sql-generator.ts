import DBSchema from '../typings/database-definition-processed';
import GeneratorSchema from '../typings/database-definition-sql-generator';

namespace sqlGenerator {
    export interface ISQLGenerator {
        createDatabase: (name: string) => string;
        createTable: (data: GeneratorSchema.Table) => string;
        createForeignKey: (foreignKey: GeneratorSchema.ForeignKey) => string;

        dropDatabase: (name: string) => string;
        dropTable: (data: GeneratorSchema.Table) => string;
    }

    export interface IGeneratedSQL {
        create: {
            database: string;
            tables: string[];
            constraints: {
                foreignKeys: string[]
            }
        };

        drop: {
            database: string;
            tables: string[];
        };
    }

    export function generate(generator: ISQLGenerator, definition: DBSchema.DatabaseDefinitionSchema): IGeneratedSQL {
        const ret: IGeneratedSQL = {
            create: {
                database: generator.createDatabase(definition.database.name),
                tables: [],
                constraints: {
                    foreignKeys: []
                }
            },
            drop: {
                database: generator.dropDatabase(definition.database.name),
                tables: []
            }
        };

        generateCreateTable(definition.database, generator, ret);
        generateCreateForeignKeys(definition.database, generator, ret);

        generateDropTables(definition.database, generator, ret);

        return ret;
    }

    function generateCreateTable(database: DBSchema.Database, generator: ISQLGenerator, sql: IGeneratedSQL) {
        for (const tableName in database.tables) {
            if (tableName) {
                const table = database.tables[tableName];
                const pk = table.primaryKey;

                sql.create.tables.push(generator.createTable({
                    name: tableName,
                    columns: transformColumns(table.columns as {[key: string]: DBSchema.Column}),
                    primaryKey: {
                        keys: typeof pk.keys === 'string' ? [pk.keys] : pk.keys
                    }
                }));
            }
        }
    }

    function generateCreateForeignKeys(database: DBSchema.Database, generator: ISQLGenerator, sql: IGeneratedSQL) {
        for (const tableName in database.tables) {
            if (tableName) {
                const table = database.tables[tableName];
                for (const foreignKeyName in table.foreignKeys) {
                    if (foreignKeyName) {
                        const foreignKey = table.foreignKeys[foreignKeyName];

                        sql.create.constraints.foreignKeys.push(generator.createForeignKey({
                            tableName,
                            name: foreignKeyName,
                            on: foreignKey.on,
                            references: foreignKey.references,
                            onUpdate: foreignKey.onUpdate,
                            onDelete: foreignKey.onDelete
                        }));
                    }
                }
            }
        }
    }

    function generateDropTables(database: DBSchema.Database, generator: ISQLGenerator, sql: IGeneratedSQL) {
        for (const tableName in database.tables) {
            if (tableName) {
                const table = database.tables[tableName];
                const pk = table.primaryKey;

                sql.drop.tables.push(generator.dropTable({
                    name: tableName,
                    columns: transformColumns(table.columns as {[key: string]: DBSchema.Column}),
                    primaryKey: {
                        keys: typeof pk.keys === 'string' ? [pk.keys] : pk.keys
                    }
                }));
            }
        }
    }

    function transformColumns(columns: {[key: string]: DBSchema.Column}): {[key: string]: GeneratorSchema.Column} {
        const ret: {[key: string]: GeneratorSchema.Column} = {};

        for (const columnName in columns) {
            if (columnName) {
                const column = columns[columnName];

                ret[columnName] = {
                    name: columnName,
                    nullable: column.nullable,
                    unique: column.unique,
                    type: column.type as GeneratorSchema.Type
                };
            }
        }

        return ret;
    }
}

export = sqlGenerator;
