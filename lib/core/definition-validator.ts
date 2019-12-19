import DBSchema from '../typings/database-definition';
import DefinitionListener from './definition-listener';
import Util from './util';
import ValidationError from './validation-error';

class DefinitionValidator implements DefinitionListener.IListener {
    public readonly classNameIndex: string[];
    public readonly getterIndex: Map<string, string[]>;
    public readonly setterIndex: Map<string, string[]>;

    public constructor() {
        this.classNameIndex = [];
        this.getterIndex = new Map();
        this.setterIndex = new Map();
    }

    public visitTableMeta(meta: DBSchema.TableMeta, data: DefinitionListener.ITableMetaData) {
        // create table name
        if (meta.className === null) {
            if (data.database.meta!.singularClassNames) {
                meta.className = Util.singularizeTableName(data.tableName);
            } else {
                meta.className = data.tableName;
            }
        }

        // add table name to index or throw error if duplicate
        if (this.classNameIndex.includes(meta.className!)) {
            throw new ValidationError.DuplicateTableName(meta.className!);
        } else {
            this.classNameIndex.push(meta.className!);
        }
    }

    public visitTable(table: DBSchema.Table, data: DefinitionListener.ITableData) {
        // required, b/C visitColumnMeta assumes, that these values are not undefined
        this.getterIndex.set(data.tableName, []);
        this.setterIndex.set(data.tableName, []);
    }

    public visitColumnMeta(meta: DBSchema.ColumnMeta, data: DefinitionListener.IColumnMetaData) {
        if (meta.getter!.name === null) {
            meta.getter!.name = Util.makeGetterName(data.columnName);
        }

        if (meta.setter!.name === null) {
            meta.setter!.name = Util.makeSetterName(data.columnName);
        }

        // add getter name to index or throw error if duplicate
        if (this.getterIndex.get(data.tableName)!.includes(meta.getter!.name!)) {
            throw new ValidationError.DuplicateGetterName(meta.getter!.name!);
        } else {
            this.getterIndex.get(data.tableName)!.push(meta.getter!.name!);
        }

        // add setter name to index or throw error if duplicate
        if (this.setterIndex.get(data.tableName)!.includes(meta.setter!.name!)) {
            throw new ValidationError.DuplicateSetterName(meta.setter!.name!);
        } else {
            this.setterIndex.get(data.tableName)!.push(meta.setter!.name!);
        }
    }
}

export = DefinitionValidator;
