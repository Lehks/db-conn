
export type SymbolName = string;
export type Type = IntType | FloatType | StringTypeReqLength | StringType | EnumType;
export type ForeignKeyTrigger = "RESTRICT" | "CASCADE" | "SET_NULL" | "NO_ACTION" | "SET_DEFAULT";

export interface DatabaseDefinitionSchema {
    database: Database;
    meta: Meta;
    columnDefs: ColumnDefs;
}

export interface Database {
    name: SymbolName;
    meta: DatabaseMeta;
    tables: {
        [k: string]: Table;
    };
}

export interface DatabaseMeta {
    singularClassNames: boolean;
}

export interface Table {
    meta: TableMeta;
    columns: {
        [k: string]: Column;
    };
    primaryKey: PrimaryKey;
    foreignKeys: {
        [k: string]: ForeignKey;
    };
}

export interface TableMeta {
    className: SymbolName;
}

export interface Column {
    unique: boolean;
    nullable: boolean;
    type: Type;
    meta: ColumnMeta;
}

export interface IntType {
    base: "tinyint" | "smallint" | "mediumint" | "int" | "bigint";
    width: number | null;
    sign: "SIGNED" | "UNSIGNED" | "ZEROFILL";
    default?: number | null;
}

export interface FloatType {
    base: "float" | "double" | "decimal";
    width: number | null;
    sign: "SIGNED" | "UNSIGNED" | "ZEROFILL";
    decimalPlaces: number | null;
    default?: number | null;
}

export interface StringTypeReqLength {
    base: "varchar";
    length: number;
    default?: string | null;
}

export interface StringType {
    base: "char" | "text";
    length: number | null;
    default?: string | null;
}

export interface EnumType {
    base: "enum";
    literals: string[];
    default?: string | null;
}

export interface ColumnMeta {
    getter: {
        name: SymbolName;
    };
    setter: {
        name: SymbolName;
    };
}

export interface PrimaryKey {
    keys: string[] | SymbolName;
}

export interface ForeignKey {
    on: SymbolName;
    references: {
        table: SymbolName;
        column: SymbolName;
    };
    onUpdate: ForeignKeyTrigger;
    onDelete: ForeignKeyTrigger;
}

export interface Meta {
    jsOutputDir: string;
    sqlOutputDir: string;
}

export interface ColumnDefs {
    [k: string]: Column;
}
