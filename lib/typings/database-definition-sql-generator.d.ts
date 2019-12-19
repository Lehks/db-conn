
export type SymbolName = string;
export type Type = IntType | FloatType | StringTypeReqLength | StringType | EnumType;
export type ForeignKeyTrigger = "RESTRICT" | "CASCADE" | "SET_NULL" | "NO_ACTION" | "SET_DEFAULT";

export interface DatabaseDefinitionSchema {
  database: Database;
}
export interface Database {
  name: SymbolName;
  tables: {
    [k: string]: Table;
  };
}
export interface Table {
    name: string;
  columns: {
    [k: string]: Column;
  };
  primaryKey: PrimaryKey;
}
export interface Column {
    name: string;
  unique: boolean;
  nullable: boolean;
  type: Type;
}
export interface IntType {
  base: "tinyint" | "smallint" | "mediumint" | "int" | "bigint";
  width: number | null;
  sign: "SIGNED" | "UNSIGNED" | "ZEROFILL";
  default: number | null;
}
export interface FloatType {
  base: "float" | "double" | "decimal";
  width: number | null;
  sign: "SIGNED" | "UNSIGNED" | "ZEROFILL";
  decimalPlaces: number | null;
  default: number | null;
}
export interface StringTypeReqLength {
  base: "varchar";
  length: number;
  default: string | null;
}
export interface StringType {
  base: "char" | "text";
  length: number | null;
  default: string | null;
}
export interface EnumType {
  base: "enum";
  literals: [string, ...string[]];
  default: string | null;
}
export interface PrimaryKey {
  keys: SymbolName[];
}
export interface ForeignKey {
    tableName: string;
    name: string;
  on: SymbolName;
  references: {
    table: SymbolName;
    column: SymbolName;
  };
  onUpdate: ForeignKeyTrigger;
  onDelete: ForeignKeyTrigger;
}
