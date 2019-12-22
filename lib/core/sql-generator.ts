import DBSchema from '../typings/database-definition-processed';
import GeneratorSchema from '../typings/database-definition-sql-generator';

namespace sqlGenerator {
    export interface ISQLGenerator {
        createTable: (data: GeneratorSchema.Table) => string;
        createForeignKey: (foreignKey: GeneratorSchema.ForeignKey) => string;

        dropTable: (data: GeneratorSchema.Table) => string;
        dropForeignKey: (data: GeneratorSchema.ForeignKey) => string;
    }

    export interface IGeneratedSQL {
        create: {
            tables: {[key: string]: string};
            constraints: {
                foreignKeys: {[key: string]: string}
            }
        };

        drop: {
            tables: {[key: string]: string};
            constraints: {
                foreignKeys: {[key: string]: string}
            }
        };
    }

    export function generate(generator: ISQLGenerator, definition: DBSchema.DatabaseDefinitionSchema): IGeneratedSQL {
        const ret: IGeneratedSQL = {
            create: {
                tables: {},
                constraints: {
                    foreignKeys: {}
                }
            },
            drop: {
                tables: {},
                constraints: {
                    foreignKeys: {}
                }
            }
        };

        generateCreateTable(definition.database, generator, ret);
        generateCreateForeignKeys(definition.database, generator, ret);

        generateDropTables(definition.database, generator, ret);
        generateDropForeignKeys(definition.database, generator, ret);

        return ret;
    }

    function generateCreateTable(database: DBSchema.Database, generator: ISQLGenerator, sql: IGeneratedSQL) {
        for (const tableName in database.tables) {
            if (tableName) {
                const table = database.tables[tableName];
                const pk = table.primaryKey;

                sql.create.tables[tableName] = generator.createTable({
                    name: tableName,
                    columns: transformColumns(table.columns as {[key: string]: DBSchema.Column}),
                    primaryKey: {
                        keys: typeof pk.keys === 'string' ? [pk.keys] : pk.keys
                    }
                });
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

                        sql.create.constraints.foreignKeys[foreignKeyName] = generator.createForeignKey({
                            tableName,
                            name: foreignKeyName,
                            on: foreignKey.on,
                            references: foreignKey.references,
                            onUpdate: foreignKey.onUpdate,
                            onDelete: foreignKey.onDelete
                        });
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

                sql.drop.tables[tableName] = generator.dropTable({
                    name: tableName,
                    columns: transformColumns(table.columns as {[key: string]: DBSchema.Column}),
                    primaryKey: {
                        keys: typeof pk.keys === 'string' ? [pk.keys] : pk.keys
                    }
                });
            }
        }
    }

    function generateDropForeignKeys(database: DBSchema.Database, generator: ISQLGenerator, sql: IGeneratedSQL) {
        for (const tableName in database.tables) {
            if (tableName) {
                const table = database.tables[tableName];
                for (const foreignKeyName in table.foreignKeys) {
                    if (foreignKeyName) {
                        const foreignKey = table.foreignKeys[foreignKeyName];

                        sql.drop.constraints.foreignKeys[foreignKeyName] = generator.dropForeignKey({
                            tableName,
                            name: foreignKeyName,
                            on: foreignKey.on,
                            references: foreignKey.references,
                            onUpdate: foreignKey.onUpdate,
                            onDelete: foreignKey.onDelete
                        });
                    }
                }
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
