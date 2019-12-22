import errors from './errors';

namespace DBAccessWrapper {
    export type Parameters = CellValue | CellValue[];
    export type QueryCallback<T> = (connection: DatabaseConnection.Connection) => Promise<T>;
    export type CellValue = string | number | boolean | Date | Buffer | null;

    export interface IRow {
        [key: string]: CellValue | undefined;
    }

    export interface IQueryResult {
        affectedRows: number;
        insertId: number;
        columns: IRow[];
    }

    export interface IDBConnectionData {
        host?: string;
        database?: string;
        user?: string;
        password?: string;
        data?: {
            [key: string]: string;
        };
    }

    type RequirementState = 'required' | 'allowed' | 'forbidden';

    export interface IDBConnectionDataRequirements {
        overall: RequirementState;
        host: RequirementState;
        database: RequirementState;
        user: RequirementState;
        password: RequirementState;
        data?: {
            [key: string]: RequirementState;
        };
    }

    export interface IDBAccessDriver {
        initialize: (connectionData?: IDBConnectionData) => Promise<void>;
        terminate: () => Promise<void>;
        getConnection: () => Promise<IDBAccessDriver.IConnection>;
        getSQLQueries: () => IDBAccessDriver.ISQLQueries;
        mapErrors: (error: any) => Error;
    }

    export namespace IDBAccessDriver {
        export interface IConnection {
            query: (sql: string, params?: Parameters) => Promise<IQueryResult>;
            beginTransaction: () => Promise<void>;
            commitTransaction: () => Promise<void>;
            rollbackTransaction: () => Promise<void>;
            end: () => Promise<void>;
        }

        export interface ISQLQueries {
            getQuery: (tableName: string, columnName: string) => string;
            setQuery: (tableName: string, columnName: string) => string;
            multiGet: (tableName: string, columnNames: string[]) => string;
            multiSet: (tableName: string, columnNames: string[]) => string;
            findById: (tableName: string) => string;
        }
    }

    function mapErrorsWrapper(driver: IDBAccessDriver, error: any): Error {
        const mapped = driver.mapErrors(error);

        if (!(mapped instanceof Error)) {
            return new UnexpectedError({
                original: error,
                mapped
            });
        } else {
            return mapped;
        }
    }

    export function checkConnectionData(connectionData: IDBConnectionData | undefined,
        requirements: IDBConnectionDataRequirements) {

        checkSingleProperty(connectionData, requirements.overall, state => `Connection data is ${state}.`);
        checkSingleProperty(connectionData!.host, requirements.host, state => `'host' is ${state}.`);
        checkSingleProperty(connectionData!.database, requirements.database, state => `'database' is ${state}.`);
        checkSingleProperty(connectionData!.user, requirements.user, state => `'user' is ${state}.`);
        checkSingleProperty(connectionData!.password, requirements.password, state => `'password' is ${state}.`);

        if (requirements.data) {
            for (const key in requirements.data) {
                if (key) {
                    if (!connectionData!.data && requirements.data[key] === 'required') {
                        throw new errors.InvalidConnectionDataException(`'data.${key}' is required.`);
                    }

                    const messageFactory = (state: string) => `'data.${key}' is ${state}.`;

                    // if connectionData.data is undefined, then the property in it is undefined as well
                    const connectionDataProperty = connectionData!.data ? connectionData!.data[key] : undefined;

                    checkSingleProperty(connectionDataProperty, requirements.data[key], messageFactory);
                }
            }
        }
    }

    function checkSingleProperty(property: any, state: RequirementState,
        errorMessage: (state: RequirementState) => string) {

        if ((state === 'required' && property === undefined) || (state === 'forbidden' && property !== undefined)) {
            throw new errors.InvalidConnectionDataException(errorMessage(state));
        }
    }

    export class DatabaseConnection {
        public driver: IDBAccessDriver;
        public isInitialized: boolean;
        public connectionData?: IDBConnectionData;

        public constructor(driver: IDBAccessDriver) {
            this.driver = driver;
            this.isInitialized = false;
        }

        public async initialize(connectionData?: IDBConnectionData) {
            if (!this.isInitialized) {
                await this.driver.initialize(connectionData);
                this.connectionData = connectionData;
                this.overridePassword(this.connectionData);
                this.isInitialized = true;
            } else {
                throw new errors.NotInitializedException();
            }
        }

        public async terminate() {
            if (this.isInitialized) {
                await this.driver.terminate();
            } else {
                throw new errors.NotInitializedException();
            }
        }

        public async query(sql: string, params: Parameters): Promise<IQueryResult> {
            return await this.multiQuery(conn => conn.query(sql, params));
        }

        public async multiQuery<T>(callback: QueryCallback<T>): Promise<T> {
            if (!this.isInitialized) {
                throw new errors.NotInitializedException();
            }

            let conn: IDBAccessDriver.IConnection | null = null;

            try {
                conn = await this.driver.getConnection();
                const ret = await callback(new DatabaseConnection.Connection(this.driver, conn));
                await conn.end();
                return ret;
            } catch (error) {
                if (conn !== null) {
                    await conn.end();
                }

                throw error;
            }
        }

        public async transaction<T>(callback: QueryCallback<T>): Promise<T> {
            if (!this.isInitialized) {
                throw new errors.NotInitializedException();
            }

            let conn: IDBAccessDriver.IConnection | null = null;
            let requiresRollback = false;

            try {
                conn = await this.driver.getConnection();
                await conn.beginTransaction();
                requiresRollback = true;

                const ret = await callback(new DatabaseConnection.Connection(this.driver, conn));

                await conn.commitTransaction();
                await conn.end();
                return ret;
            } catch (error) {
                if (conn && requiresRollback) {
                    await conn.rollbackTransaction();
                }

                if (conn !== null) {
                    await conn.end();
                }

                throw error;
            }
        }

        private overridePassword(connectionData?: IDBConnectionData) {
            if (connectionData && connectionData.password) {
                connectionData.password = '********';
            }
        }
    }

    export namespace DatabaseConnection {
        export class Connection {
            private readonly driver: IDBAccessDriver;
            private readonly connection: IDBAccessDriver.IConnection;

            public constructor(driver: IDBAccessDriver, connection: IDBAccessDriver.IConnection) {
                this.driver = driver;
                this.connection = connection;
            }

            public async query(sql: string, params?: Parameters): Promise<IQueryResult> {
                try {
                    return await this.connection.query(sql, params);
                } catch (error) {
                    throw mapErrorsWrapper(this.driver, error);
                }
            }
        }
    }

    export class Error extends global.Error {
        public readonly data: any;

        public constructor(data: any, message: string) {
            super(message);
            this.data = data;
        }
    }

    export class UnexpectedError extends Error {
        public constructor(data: any) {
            super(data, 'An unexpected error has occurred in an SQL query.');
        }
    }
}

export = DBAccessWrapper;
