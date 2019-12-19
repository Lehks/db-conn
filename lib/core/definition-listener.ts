import DBSchema from '../typings/database-definition';

namespace DefinitionListener {
    type ListenerFN<T, D> = (param: T, data: D) => void | Promise<void>;
    type VisitorPostFN<T, D> = (param: T, data: D) => void | Promise<void>;

    export interface IDatabaseData {
        definition: DBSchema.DatabaseDefinitionSchema;
    }

    export interface IDatabaseMetaData extends IDatabaseData {
        database: DBSchema.Database;
    }

    export interface ITableData extends IDatabaseMetaData {
        tableName: string;
    }

    export interface ITableMetaData extends ITableData {
        table: DBSchema.Table;
    }

    export interface IColumnData extends ITableData {
        columnName: string;
    }

    export interface IColumnMetaData extends IColumnData {
        column: DBSchema.Column;
    }

    export type IColumnTypeData = IColumnData;
    export type IPrimaryKeyData = ITableData;

    export interface IForeignKeyData extends ITableData {
        foreignKeyName: string;
    }

    export interface IListener {
        visitDefinition?: ListenerFN<DBSchema.DatabaseDefinitionSchema, {}>;
        visitDefinitionPost?: VisitorPostFN<DBSchema.DatabaseDefinitionSchema, {}>;
        visitMeta?: ListenerFN<DBSchema.Meta, IDatabaseData>;
        visitColumnDef?: ListenerFN<DBSchema.ColumnDefs, IDatabaseData>;
        visitDatabase?: ListenerFN<DBSchema.Database, IDatabaseData>;
        visitDatabaseMeta?: ListenerFN<DBSchema.DatabaseMeta, IDatabaseMetaData>;
        visitTable?: ListenerFN<DBSchema.Table, ITableData>;
        visitTableMeta?: ListenerFN<DBSchema.TableMeta, ITableMetaData>;
        visitColumn?: ListenerFN<DBSchema.Column, IColumnData>;
        visitColumnMeta?: ListenerFN<DBSchema.ColumnMeta, IColumnMetaData>;
        visitColumnType?: ListenerFN<DBSchema.Type, IColumnTypeData>;
        visitPrimaryKey?: ListenerFN<DBSchema.PrimaryKey, IPrimaryKeyData>;
        visitForeignKey?: ListenerFN<DBSchema.ForeignKey, IForeignKeyData>;
    }

    class MetaListener implements IListener {
        public readonly wrappedVisitor: IListener;

        public constructor(wrappedVisitor: IListener) {
            this.wrappedVisitor = wrappedVisitor;
        }

        public async visitDefinition(definition: DBSchema.DatabaseDefinitionSchema) {
            if (this.wrappedVisitor.visitDefinition) {
                await this.wrappedVisitor.visitDefinition(definition, {});
            }

            await this.visitMeta!(definition.meta!, {definition});
            await this.visitDatabase!(definition.database, {definition});
        }

        public async visitMeta(meta: DBSchema.Meta, data: IDatabaseData) {
            if (this.wrappedVisitor.visitMeta) {
                await this.wrappedVisitor.visitMeta(meta, data);
            }
        }

        public async visitDatabase(database: DBSchema.Database, data: IDatabaseData) {
            if (this.wrappedVisitor.visitDatabase) {
                await this.wrappedVisitor.visitDatabase(database, data);
            }

            await this.visitDatabaseMeta!(database.meta!, {...data, database});

            for (const tableName of Object.keys(database.tables!)) {
                await this.visitTable!(database.tables![tableName], {...data, database, tableName});
            }
        }

        public async visitDatabaseMeta(meta: DBSchema.DatabaseMeta, data: IDatabaseMetaData) {
            if (this.wrappedVisitor.visitDatabaseMeta) {
                await this.wrappedVisitor.visitDatabaseMeta(meta, data);
            }
        }

        public async visitTable(table: DBSchema.Table, data: ITableData) {
            if (this.wrappedVisitor.visitTable) {
                await this.wrappedVisitor.visitTable(table, data);
            }

            await this.visitTableMeta!(table.meta!, {...data, table});

            for (const columnName of Object.keys(table.columns!)) {
                await this.visitColumn!(table.columns![columnName] as DBSchema.Column, {...data, columnName});
            }

            await this.visitPrimaryKey!(table.primaryKey, {...data});

            for (const foreignKeyName of Object.keys(table.foreignKeys!)) {
                await this.visitForeignKey!(table.foreignKeys![foreignKeyName], {...data, foreignKeyName});
            }

        }

        public async visitTableMeta(meta: DBSchema.TableMeta, data: ITableMetaData) {
            if (this.wrappedVisitor.visitTableMeta) {
                await this.wrappedVisitor.visitTableMeta(meta, data);
            }
        }

        public async visitColumn(column: DBSchema.Column, data: IColumnData)  {
            if (this.wrappedVisitor.visitColumn) {
                await this.wrappedVisitor.visitColumn(column, data);
            }

            await this.visitColumnMeta!(column.meta!, {...data, column});
            await this.visitColumnType!(column.type!, {...data});
        }

        public async visitColumnMeta(meta: DBSchema.ColumnMeta, data: IColumnMetaData)  {
            if (this.wrappedVisitor.visitColumnMeta) {
                await this.wrappedVisitor.visitColumnMeta(meta, data);
            }
        }

        public async visitColumnType(type: DBSchema.Type, data: IColumnTypeData)  {
            if (this.wrappedVisitor.visitColumnType) {
                await this.wrappedVisitor.visitColumnType(type, data);
            }
        }

        public async visitPrimaryKey(primaryKey: DBSchema.PrimaryKey, data: IPrimaryKeyData)  {
            if (this.wrappedVisitor.visitPrimaryKey) {
                await this.wrappedVisitor.visitPrimaryKey(primaryKey, data);
            }
        }

        public async visitForeignKey(foreignKey: DBSchema.ForeignKey, data: IForeignKeyData) {
            if (this.wrappedVisitor.visitForeignKey) {
                await this.wrappedVisitor.visitForeignKey(foreignKey, data);
            }
        }
    }

    export async function visit(visitor: IListener, definition: DBSchema.DatabaseDefinitionSchema) {

        await new MetaListener(visitor).visitDefinition!(definition);
    }
}

export = DefinitionListener;
