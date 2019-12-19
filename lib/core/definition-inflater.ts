import _ from 'lodash';
import DBSchema from '../typings/database-definition';
import DBSchemaExtended from '../typings/database-definition-extension';
import DefinitionListener from './definition-listener';
import ValidationError from './validation-error';

class DefinitionInflater implements DefinitionListener.IListener {
    public visitDefinition(definition: DBSchema.DatabaseDefinitionSchema) {
        (definition as DBSchemaExtended.DatabaseDefinitionSchema)._id = 'DatabaseDefinitionSchema';

        if (definition.meta === undefined) {
            definition.meta = {};
        }
    }

    public visitMeta(meta: DBSchema.Meta) {
        (meta as DBSchemaExtended.Meta)._id = 'Meta';

        if (meta.jsOutputDir === undefined) {
            meta.jsOutputDir = DefinitionInflater.Defaults.META_JS_OUTPUT_DIR;
        }

        if (meta.sqlOutputDir === undefined) {
            meta.sqlOutputDir = DefinitionInflater.Defaults.META_SQL_OUTPUT_DIR;
        }
    }

    public visitDatabase(database: DBSchema.Database) {
        (database as DBSchemaExtended.Database)._id = 'Database';

        if (database.meta === undefined) {
            database.meta = {};
        }

        if (database.tables === undefined) {
            database.tables = {};
        }
    }

    public visitDatabaseMeta(meta: DBSchema.DatabaseMeta) {
        (meta as DBSchemaExtended.DatabaseMeta)._id = 'DatabaseMeta';

        if (meta.singularClassNames === undefined) {
            meta.singularClassNames = DefinitionInflater.Defaults.DATABASE_META_SINGULAR_CLASS_NAMES;
        }
    }

    public visitTable(table: DBSchema.Table, data: DefinitionListener.ITableData) {
        (table as DBSchemaExtended.Table)._id = 'Table';

        if (table.meta === undefined) {
            table.meta = {};
        }

        if (table.foreignKeys === undefined) {
            table.foreignKeys = {};
        }

        // replace columnDefs with the actual columns
        for (const columnName in table.columns) {
            if (columnName) {
                const column = table.columns[columnName];

                // before inflation, this is still possible
                if (typeof column === 'string') {
                    if (!data.definition.columnDefs || !data.definition.columnDefs[column]) {
                        throw new ValidationError.InvalidColumnDefinition(column);
                    }

                    // can't use 'column' here
                    table.columns[columnName] = _.cloneDeep(data.definition.columnDefs[column]);
                }
            }
        }
    }

    public visitTableMeta(meta: DBSchema.TableMeta) {
        (meta as DBSchemaExtended.TableMeta)._id = 'TableMeta';

        if (meta.className === undefined) {
            meta.className = DefinitionInflater.Defaults.DATABASE_TABLE_META_CLASS_NAME;
        }
    }

    public visitPrimaryKey(primaryKey: DBSchema.PrimaryKey) {
        (primaryKey as DBSchemaExtended.PrimaryKey)._id = 'PrimaryKey';
    }

    public visitForeignKey(foreignKey: DBSchema.ForeignKey) {
        (foreignKey as DBSchemaExtended.ForeignKey)._id = 'ForeignKey';

        if (foreignKey.onUpdate === undefined) {
            foreignKey.onUpdate = DefinitionInflater.Defaults.DATABASE_TABLE_FOREIGN_KEY_ON_UPDATE;
        }

        if (foreignKey.onUpdate === undefined) {
            foreignKey.onUpdate = DefinitionInflater.Defaults.DATABASE_TABLE_FOREIGN_KEY_ON_DELETE;
        }
    }

    public visitColumn(column: DBSchema.Column) {
        (column as DBSchemaExtended.Column)._id = 'Column';

        if (column.meta === undefined) {
            column.meta = {};
        }

        if (column.unique === undefined) {
            column.unique = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_UNIQUE;
        }

        if (column.nullable === undefined) {
            column.nullable = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_NULLABLE;
        }
    }

    public visitColumnMeta(meta: DBSchema.ColumnMeta) {
        (meta as DBSchemaExtended.ColumnMeta)._id = 'ColumnMeta';

        if (meta.getter === undefined) {
            meta.getter = {};
        }

        if (meta.setter === undefined) {
            meta.setter = {};
        }

        if (meta.getter.name === undefined) {
            meta.getter.name = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_META_GETTER_NAME;
        }

        if (meta.setter.name === undefined) {
            meta.setter.name = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_META_SETTER_NAME;
        }
    }

    public visitColumnType(type: DBSchema.Type) {
        switch (type.base) {
            case 'tinyint':
            case 'smallint':
            case 'mediumint':
            case 'int':
            case 'bigint':
                this.inflateIntType(type);
                break;
            case 'float':
            case 'double':
            case 'decimal':
                this.inflateFloatType(type);
                break;
            case 'char':
            case 'text':
                this.inflateStringType(type);
                break;
            case 'varchar':
                this.inflateStringTypeReqLength(type);
                break;
            case 'enum':
                this.inflateEnumType(type);
                break;
        }

        // if 'default' is undefined, this is fine
    }

    private inflateIntType(type: DBSchema.IntType) {
        (type as DBSchemaExtended.IntType)._id = 'IntType';

        if (type.width === undefined) {
            type.width = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_TYPE_INT_WIDTH;
        }

        if (type.sign === undefined) {
            type.sign = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_TYPE_INT_SIGN;
        }
    }

    private inflateFloatType(type: DBSchema.FloatType) {
        (type as DBSchemaExtended.FloatType)._id = 'FloatType';

        if (type.width === undefined) {
            type.width = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_TYPE_FLOAT_WIDTH;
        }

        if (type.sign === undefined) {
            type.sign = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_TYPE_FLOAT_SIGN;
        }

        if (type.decimalPlaces === undefined) {
            type.decimalPlaces = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_TYPE_FLOAT_DECIMAL_PLACES;
        }
    }

    private inflateStringType(type: DBSchema.StringType) {
        (type as DBSchemaExtended.StringType)._id = 'StringType';

        if (type.length === undefined) {
            type.length = DefinitionInflater.Defaults.DATABASE_TABLE_COLUMN_TYPE_STRING_LENGTH;
        }
    }

    private inflateStringTypeReqLength(type: DBSchema.StringTypeReqLength) {
        (type as DBSchemaExtended.StringTypeReqLength)._id = 'StringType';
    }

    private inflateEnumType(type: DBSchema.EnumType) {
        (type as DBSchemaExtended.EnumType)._id = 'EnumType';
    }
}

namespace DefinitionInflater {
    export namespace Defaults {
        export const META_JS_OUTPUT_DIR = './';
        export const META_SQL_OUTPUT_DIR = './';
        export const DATABASE_META_SINGULAR_CLASS_NAMES = true;
        export const DATABASE_TABLE_META_CLASS_NAME = null;
        export const DATABASE_TABLE_COLUMN_UNIQUE = false;
        export const DATABASE_TABLE_COLUMN_NULLABLE = true;
        export const DATABASE_TABLE_COLUMN_META_GETTER_NAME = null;
        export const DATABASE_TABLE_COLUMN_META_SETTER_NAME = null;
        export const DATABASE_TABLE_FOREIGN_KEY_ON_UPDATE = 'RESTRICT';
        export const DATABASE_TABLE_FOREIGN_KEY_ON_DELETE = 'RESTRICT';
        export const DATABASE_TABLE_COLUMN_TYPE_INT_WIDTH = null;
        export const DATABASE_TABLE_COLUMN_TYPE_INT_SIGN = 'SIGNED';
        export const DATABASE_TABLE_COLUMN_TYPE_FLOAT_WIDTH = null;
        export const DATABASE_TABLE_COLUMN_TYPE_FLOAT_SIGN = 'SIGNED';
        export const DATABASE_TABLE_COLUMN_TYPE_FLOAT_DECIMAL_PLACES = null;
        export const DATABASE_TABLE_COLUMN_TYPE_STRING_LENGTH = null;

    }
}

export = DefinitionInflater;
