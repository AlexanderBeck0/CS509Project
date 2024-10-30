import mysql from 'mysql';
// ######################################################
// Please see README.md for information as to this folder
// ######################################################

/**
 * Creates a mysql pool
 * @returns {mysql.Pool} A mysql pool
 * @example
 * ```JS
 * import { createPool, getAccountByUsername } from "../opt/nodejs/index.mjs";
 * let pool;
 * try {
 *      pool = await createPool();
 * } catch (error) {
 *      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
 *      return { statusCode: 500, error: "Could not make database connection" };
 * }
 * ```
 */
export async function createPool() {
    console.log('Creating MySQL pool...');
    var pool = mysql.createPool({
        host: "auctionhousedb.chyqe6cmmf08.us-east-1.rds.amazonaws.com",
        user: "auctionadmin",
        password: "sp6dO9CPdNecytAhsnQm",
        database: "auctionhouse"
    });
    return pool;
}

/**
 * Gets the account from the pool based on the username.
 * @param {string!} username The username to get. Must be defined and cannot be an empty string.
 * @param {mysql.Pool} pool The pool to get the username from.
 * @param {boolean} [debug=false] A flag to tell the function to print its findings to the console. Defaults to false.
 * @returns {Promise<{username: string, accountType: "Seller" | "Buyer" | "Admin", balance: number, isActive: boolean} | undefined>} The account found or `undefined` if the account was not found.
 * @throws {TypeError} Thrown if there is an issue with the input.
 * @example
 * ```JS
 * import { createPool, getAccountByUsername } from "../opt/nodejs/index.mjs";
 * let pool;
 * try {
 *      pool = await createPool();
 * } catch (error) {
 *      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
 *      return { statusCode: 500, error: "Could not make database connection" };
 * }
 * const account = await getAccountByUsername(username, pool);
 * ```
 */
export async function getAccountByUsername(username, pool, debug = false) {
    // Validate username
    if (username === undefined || username === null || typeof username !== 'string') {
        const error = new TypeError('Invalid username parameter. Expected a string.');
        if (debug) console.error(error);
        throw error;
    }

    if (username.length < 1) {
        const error = new TypeError('Empty string is not a username!');
        if (debug) console.error(error);
        throw error;
    }

    // Validate pool
    if (pool === undefined || pool === null) {
        const error = new TypeError('pool parameter is not defined.');
        if (debug) console.error(error);
        throw error;
    }

    // Valid username and pool at this point
    const query = `
        SELECT username, accountType, isActive, balance FROM Account
        WHERE username = ?
        `;

    return new Promise((resolve, reject) => {
        pool.query(query, [username], (error, results) => {
            if (error) {
                if (debug) console.error("MySQL Query error: " + JSON.stringify(error));
                return reject(error);
            }

            if (!results || results.length === 0) {
                if (debug) console.log("Account doesn't exist");
                return resolve(undefined);
            }

            // Account was found
            if (debug) console.log("Account was found: " + JSON.stringify(results[0]));
            return resolve(results[0]);
        });
    });
}