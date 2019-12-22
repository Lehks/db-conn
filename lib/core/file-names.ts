
namespace fileNames {
    export const CREATE_TABLE_PREFIX = 'create-table-';
    export const CREATE_CONSTRAINT_PREFIX = 'create-constraint-';
    export const DROP_TABLE_PREFIX = 'drop-table-';
    export const DROP_CONSTRAINT_PREFIX = 'drop-constraint-';

    // transforms myTable to my-table
    // and my_table to my-table
    function toMinusCase(name: string): string {
        // make upper case at the start lower case
        let ret = name.replace(/^([A-Z]+)/, s => s.toLowerCase());

        // replace remaining upper case letters with a minus and the lower case letter
        ret = ret.replace(/[A-Z]+/, s => `-${s.toLowerCase()}`);

        // convert snake to minus case
        ret = ret.replace(/_/, '-');

        return ret;
    }

    export function getCreateTableFileName(tableName: string): string {
        return `${CREATE_TABLE_PREFIX}${toMinusCase(tableName)}.sql`;
    }

    export function getCreateConstraintFileName(constraintName: string): string {
        return `${CREATE_CONSTRAINT_PREFIX}${toMinusCase(constraintName)}.sql`;
    }

    export function getDropTableFileName(constraintName: string): string {
        return `${DROP_TABLE_PREFIX}${toMinusCase(constraintName)}.sql`;
    }

    export function getDropConstraintFileName(constraintName: string): string {
        return `${DROP_CONSTRAINT_PREFIX}${toMinusCase(constraintName)}.sql`;
    }
}

export = fileNames;
