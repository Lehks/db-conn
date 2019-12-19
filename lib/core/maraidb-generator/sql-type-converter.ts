import GeneratorSchema from '../../typings/database-definition-sql-generator';

namespace sqlTypeConverter {
    export function makeTypeSQL(type: GeneratorSchema.Type): string {
        switch (type.base) {
            case 'tinyint':
            case 'smallint':
            case 'mediumint':
            case 'int':
            case 'bigint': {
                    const width = type.width !== null ? `(${type.width})` : '';
                    return `${makeTypeSQLName(type)}${width} ${type.sign}`;
                }

            case 'float':
            case 'double':
            case 'decimal': {
                    let widthAndDecPlaces: string;

                    if (type.width !== null) {
                        if (type.decimalPlaces !== null) {
                            widthAndDecPlaces = `(${type.width}, ${type.decimalPlaces})`;
                        } else {
                            widthAndDecPlaces = `(${type.width})`;
                        }
                    } else {
                        widthAndDecPlaces = '';
                    }

                    return `${makeTypeSQLName(type)}${widthAndDecPlaces} ${type.sign}`;
                }

            case 'char':
            case 'varchar':
            case 'text': {
                const length = type.length !== null ? `(${type.length})` : '';
                return `${makeTypeSQLName(type)}${length}`;
            }

            case 'enum': {
                return `${makeTypeSQLName(type)}(${type.literals.map(l => `'${l}'`).join(', ')})`;
            }
        }
    }

    function makeTypeSQLName(type: GeneratorSchema.Type): string {
        switch (type.base) {
            case 'tinyint':
                return 'TINYINT';
            case 'smallint':
                return 'SMALLINT';
            case 'mediumint':
                return 'MEDIUMINT';
            case 'int':
                return 'INT';
            case 'bigint':
                return 'BIGINT';

            case 'float':
                return 'FLOAT';
            case 'double':
                return 'DOUBLE';
            case 'decimal':
                return 'DECIMAL';

            case 'char':
                return 'CHAR';
            case 'varchar':
                return 'VARCHAR';
            case 'text':
                return 'TEXT';

            case 'enum':
                return 'ENUM';
        }
    }

    export function makeDefault(type: GeneratorSchema.Type): string {
        if (type.default === undefined) {
            return '';
        } else if (type.default === null) {
            return 'NULL';
        } else if (typeof type.default === 'number') {
            return type.default.toString();
        } else {
            return type.default;
        }
    }

}

export = sqlTypeConverter;
