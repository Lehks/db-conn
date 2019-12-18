import DBSchema from './database-definition'

export interface DatabaseDefinitionSchema extends DBSchema.DatabaseDefinitionSchema {
    _id: 'DatabaseDefinitionSchema'
}

export interface Meta extends DBSchema.Meta {
    _id: 'Meta'
}

export interface Database extends DBSchema.Database {
    _id: 'Database'
}

export interface DatabaseMeta extends DBSchema.DatabaseMeta {
    _id: 'DatabaseMeta'
}

export interface Table extends DBSchema.Table {
    _id: 'Table'
}

export interface TableMeta extends DBSchema.TableMeta {
    _id: 'TableMeta'
}

export interface Column extends DBSchema.Column {
    _id: 'Column'
}

export interface ColumnMeta extends DBSchema.ColumnMeta {
    _id: 'ColumnMeta'
}

export interface IntType extends DBSchema.IntType {
    _id: 'IntType'
}

export interface FloatType extends DBSchema.FloatType {
    _id: 'FloatType'
}

export interface StringTypeReqLength extends DBSchema.StringTypeReqLength {
    _id: 'StringType'
}

export interface StringType extends DBSchema.StringType {
    _id: 'StringType'
}

export interface EnumType extends DBSchema.EnumType {
    _id: 'EnumType'
}

export interface PrimaryKey extends DBSchema.PrimaryKey {
    _id: 'PrimaryKey'
}

export interface ForeignKey extends DBSchema.ForeignKey {
    _id: 'ForeignKey'
}

export type SymbolName = DBSchema.SymbolName;
export type Type = IntType | FloatType | StringTypeReqLength | StringType | EnumType;
export type ForeignKeyTrigger = DBSchema.ForeignKeyTrigger;
