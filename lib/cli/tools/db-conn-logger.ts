import DBAccess from '../../runtime/db-access-wrapper';
import logger from './logger';

namespace dbConnLogger {
    export function log(conn: DBAccess.DatabaseConnection, logFn: (msg: string) => void) {
        if (!conn.connectionData) {
            logFn('No connection data was passed to the connection.');
        } else {
            // +3 to have at least 3 dots
            const longestKey = getLongestKey(conn.connectionData) + 3;

            logFn(`${'Host'.padEnd(longestKey, '.')}${makeValue(conn.connectionData.host)}`);
            logFn(`${'Database'.padEnd(longestKey, '.')}${makeValue(conn.connectionData.database)}`);
            logFn(`${'User'.padEnd(longestKey, '.')}${makeValue(conn.connectionData.user)}`);
            logFn(`${'Password'.padEnd(longestKey, '.')}${makePassword(conn.connectionData.password)}`);

            const data = conn.connectionData.data;

            if (data) {
                for (const key in data) {
                    if (key) {
                        logFn(`${key.padEnd(longestKey, '.')}${makeValue(data[key])}`);
                    }
                }
            }
        }
    }

    function getLongestKey(connectionData: DBAccess.IDBConnectionData): number {
        // 'Database' is the longest of 'Host', 'Database', 'User', 'Password'
        let longest = 'Database'.length;

        for (const key in connectionData.data) {
            if (key) {
                if (key.length > longest) {
                    longest = key.length;
                }
            }
        }

        return longest;
    }

    function makeValue(value?: string): string {
        return value === undefined ? 'unknown' : value;
    }

    function makePassword(pw?: string): string {
        return pw === undefined ? '<NO PASSWORD>' : pw;
    }
}

export = dbConnLogger;
