import mariadb from 'mariadb';
import DBAccess from '../../runtime/db-access-wrapper';

let pool = undefined as unknown as mariadb.Pool;

const driver: DBAccess.IDBAccessDriver = {
    initialize: async connectionData => {
        DBAccess.checkConnectionData(connectionData, {
            overall: 'required',
            host: 'required',
            database: 'required',
            user: 'required',
            password: 'required'
        });

        pool = mariadb.createPool({
            host: connectionData?.host,
            database: connectionData?.database,
            user: connectionData?.user,
            password: connectionData?.password,
            multipleStatements: true
        });
    },

    terminate: async () => {
        await pool.end();
    },

    mapErrors: error => {
        return new DBAccess.UnexpectedError({error});
    },

    getConnection: async () => {
        const connection = await pool.getConnection();

        return {
            beginTransaction: async () => {
                await connection.beginTransaction();
            },
            commitTransaction: async () => {
                await connection.commit();
            },
            rollbackTransaction: async () => {
                await connection.rollback();
            },
            query: async (sql, params) => {
                const result = await connection.query(sql, params);
                const ret: DBAccess.IQueryResult = {
                    insertId: result.insertId,
                    affectedRows: result.affectedRows,
                    columns: []
                };

                // for (let i = 0; i < result.length; i++) {
                for (const row of result) {
                    ret.columns.push(row);
                }

                return ret;
            },
            end: async () => {
                await connection.end();
                connection.release();
            }
        };
    },

    getSQLQueries: () => {
        return {
            findById: () => '',
            getQuery: () => '',
            multiGet: () => '',
            multiSet: () => '',
            setQuery: () => ''
        };
    }
};

export = driver;
