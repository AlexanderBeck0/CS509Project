// ######################################################
// Please see README.md for information as to this folder
// ######################################################

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';
dotenv.config();
const JWT_KEY = `${process.env.WEB_TOKEN_KEY}`;

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

/**
 * @param {{username: string, accountType: "Seller" | "Buyer" | "Admin", isActive: boolean, balance: number}} account The account to generate a token for
 * @returns {Promise<string>} The token that is being returned.
 * @example
 * ```JS
 * import { createPool, getAccountByUsername, generateToken } from "../opt/nodejs/index.mjs";
 * let pool;
 * try {
 *      pool = await createPool();
 * } catch (error) {
 *      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
 *      return { statusCode: 500, error: "Could not make database connection" };
 * }
 * const account = await getAccountByUsername(username, pool);
 * if (account) {
 *      const token = await generateToken(account);
 * }
 * ```
 */
export async function generateToken(account) {
    const payload = {
        username: account.username,
    };

    return new Promise(async (resolve, reject) => {
        if (!account) reject("Account must be defined");
        return jwt.sign(payload, JWT_KEY, { expiresIn: '1h' }, (err, token) => {
            if (err) return reject(err);
            return resolve(token);
        });
    });
}


/**
 * @param {string} token The token to get the username from.
 * @returns {Promise<string | undefined>} The username from `token`, or `undefined` if the username is not proper.
 * @example
 * ```JS
 * import { getUsernameFromToken } from "../opt/nodejs/index.mjs";
 * const username = await getUsernameFromToken(token);
 * ```
 */
export async function getUsernameFromToken(token) {
    return new Promise(async (resolve, reject) => {
        if (!token) reject("Token must be defined");
        try {
            const decoded = jwt.decode(token, JWT_KEY);
            const username = decoded.username;

            return resolve(username);
        } catch (error) {
            console.error("Failed to get username from token: " + error);
            return resolve(undefined);
        }
    });
}

/**
 * @param {string} token The token to verify.
 * @returns {Promise<boolean>} A Promise of the validitity of `Token`
 */
export async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        return jwt.verify(token, JWT_KEY, (err, decoded) => {
            if (err) {
                console.error(err);
                return reject(err);
            }

            // Token is expired
            if (decoded.exp < Date.now() / 1000) {
                return resolve(false);
            }

            return resolve(true);
        });
    });
}