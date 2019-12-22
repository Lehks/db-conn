
namespace errors {
    export class NotFoundError extends Error {
        public readonly tableName: string;
        public readonly columnName: string;

        public constructor(tableName: string, columnName: string) {
            super(); // todo
            this.tableName = tableName;
            this.columnName = columnName;
        }
    }

    export class MultiColumnNotFoundError extends Error {
        public readonly tableName: string;
        public readonly columnNames: string[];

        public constructor(tableName: string, columnNames: string[]) {
            super(); // todo
            this.tableName = tableName;
            this.columnNames = columnNames;
        }
    }

    export class NotInitializedException extends Error {
        public constructor() {
            super('Database connection has not been initialized yet.');
        }
    }

    export class InvalidConnectionDataException extends Error {
        public constructor(msg: string) {
            super(msg);
        }
    }
}

export = errors;
