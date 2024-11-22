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
 * import { createPool } from "../opt/nodejs/index.mjs";
 * let pool;
 * try {
 *      pool = await createPool();
 * } catch (error) {
 *      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
 *      return { statusCode: 500, error: "Could not make database connection" };
 * }
 * 
 * return new Promise((resolve) => {
 *      try {
 *          // Your code here
 *      } catch (error) {
 *          // Your code here
 *      } finally {
 *          // Close the connection to the pool
 *          pool.end((err) => {
 *              if (err) {
 *                  console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
 *              }
 *          });
 *      }
 * });
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
 * 
 * try {
 *      const account = await getAccountByUsername(username, pool);
 * } catch (error) {
 *      console.error(error);
 *      // Handle error here
 * } finally {
 *      pool.end((err) => {
 *          if (err) {
 *              console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
 *          }
 *      });
 * }
 * ```
 */
export async function getAccountByUsername(username, pool, debug = false) {
    // Validate username
    if (username === undefined || username === null || typeof username !== 'string') {
        const error = new TypeError(`Invalid username parameter. Expected a string. Instead recieved '${username}' of type ${typeof username}`);
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
        accountType: account.accountType
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
 * @param {string} token The token to get the accountType from.
 * @returns {Promise<string | undefined>} The accountType from `token`, or `undefined` if the token is invalid.
 * @example
 * ```JS
 * import { getAccountTypeFromToken } from "../opt/nodejs/index.mjs";
 * const accountType = await getAccountTypeFromToken(token);
 * ```
 */
export async function getAccountTypeFromToken(token) {
    return new Promise(async (resolve, reject) => {
        if (!token) reject("Token must be defined");
        try {
            const decoded = jwt.decode(token, JWT_KEY);
            const accountType = decoded.accountType

            return resolve(accountType);
        } catch (error) {
            console.error("Failed to get accountType from token: " + error);
            return resolve(undefined);
        }
    });
}

/**
 * Verifies the authenticity of a given JWT (jsonwebtoken)
 * @param {string} token The token to verify.
 * @returns {Promise<{username: string | null, accountType: ("Seller" | "Buyer" | "Admin") | null}>} A Promise of the validitity of `Token`
 * @example
 * ```JS
 * // Synchronous
 * const {username, accountType} = await verifyToken(token);
 * const isValid = username && accountType;
 * ```
 * @example
 * ```JS
 * // Asynchronous
 * return new Promise((resolve) => {
 *      verifyToken(token).then(({username, accountType}) => {
 *          return resolve({
 *              statusCode: 200,
 *              body: JSON.stringify(username, accountType)
 *          });
 *      }).catch(error => {
 *          return resolve({
 *              statusCode: 400,
 *              body: JSON.stringify(error instanceof Error ? error.message : error)
 *          });
 *      });
 * });
 * ```
 * @example
 * ```JS
 * // A usage example
 * const { username } = await verifyToken(event.token).catch(error => {
 *      if (error instanceof Error && error.name === "TokenExpiredError") {
 *          return {
 *              statusCode: 400,
 *              error: "Your token has expired. Please log in again."
 *          };
 *      }
 * });
 * const account = await getAccountByUsername(username, pool);
 * ```
 */
export async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        return jwt.verify(token, JWT_KEY, (err, decoded) => {
            if (err) {
                // Ensure that TokenExpiredError does not reject but rather resolves false
                // if (err.name === 'TokenExpiredError') return resolve(false);
                console.error(err);
                return reject(err);
            }

            // Token is expired
            if (decoded.exp < Date.now() / 1000) {
                return reject("Token is expired");
            }

            return resolve({ username: decoded.username, accountType: decoded.accountType });
        });
    });
}

/**
 * Do **NOT** export this function. It is for internal use only. This is so that no one accidentally uses this when trying to get an item, without proper checks.
 * 
 * Gets an item from its id. Does not do any checks.
 * @param {number} id The item id.
 * @param {mysql.Pool} pool The pool to get the item with.
 * @returns {Promise<{id: number, name: string, description?: string, image: string, initialPrice: number, price?: number, startDate: Date | string, endDate?: Date | string, archived: boolean, status: "Active" | "Inactive" | "Frozen" | "Requested" | "Failed" | "Completed" | "Fulfilled", forSale: boolean, seller_username: string, bids: {id: number, bid: number, timeOfBid: Date | string, buyer_username: string} | []} | undefined>} The item, or `undefined` if it is not found.
 * @throws {TypeError} Throws a {@link TypeError} when the ID is less than 0 or is not a number.
 * @throws {TypeError} Throws a {@link TypeError} when username is not a valid username.
 * @throws {TypeError} Throws a {@link TypeError} when the pool is invalid.
 */
function _getItemFromIDNoChecks(id, pool) {
    // DO NOT EXPORT THIS FUNCTION  
    if ((typeof id !== 'number' || isNaN(id)) && isNaN(Number.parseInt(id))) throw new TypeError(`ID must be a number. Instead recieved "${+id}" of type ${typeof +id} (${id} of type ${typeof id})`);
    if (+id < 0) throw new TypeError("ID must be greater than 0! Instead recieved " + id);

    // Validate pool
    if (pool === undefined || pool === null) {
        const error = new TypeError('pool parameter is not defined.');
        console.error(error);
        throw error;
    }
    // https://stackoverflow.com/questions/37470949/how-do-i-generate-nested-json-objects-using-mysql-native-json-functions
    const itemQuery = `
    SELECT Item.*, IF (COUNT(Bid.id) = 0, 
        JSON_ARRAY(), 
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', Bid.id,
                'bid', Bid.bid,
                'timeOfBid', Bid.timeOfBid,
                'buyer_username', Bid.buyer_username
            )
        )
    ) AS bids
    FROM Item
    LEFT JOIN Bid ON Item.id = Bid.item_id
    WHERE Item.id = ?
    `
    return new Promise((resolve, reject) => {
        pool.query(itemQuery, [id], (error, results) => {
            if (error) {
                console.error("MySQL Query error: " + JSON.stringify(error));
                return reject(error);
            }

            if (!results || results.length === 0 || results['id'] === null) {
                console.log("Item doesn't exist");
                return resolve(undefined);
            }

            return resolve(results[0]);
        });
    });
}

/**
 * Gets the item from its ID.
 * 
 * # `accountType` cases:
 * ## Seller
 * Returns the item only if the item is the Seller's. Also includes the bids.
 * ## Buyer
 * Returns the item only if the item is active or has only been SOLD (Completed, Fulfilled) within 24 hours. Will not return any older items. Also returns bid information (date made, bid, buyer id).
 * ## Admin
 * Cannot view items.
 * ## Customer (`undefined`)
 * (Default). Returns only active items. Does not return any information about the bids. Only returns the current price, not the initial price.
 * @param {number} id The item's id.
 * @param {mysql.Pool} pool The current pool connection.
 * @param {string | undefined} [username=undefined] The username requesting the item. The resulting item will change depending on the account type. Defaults to `undefined`.
 * @returns {Promise<{id: number, name: string, description?: string, image: string, initialPrice: number, price?: number, startDate: Date | string, endDate?: Date | string, archived: boolean, status: "Active" | "Inactive" | "Frozen" | "Requested" | "Failed" | "Completed" | "Fulfilled", forSale: boolean, seller_username: string} | {id: number, name: string, description: string, image: string, price: number, startDate: Date | string, endDate?: Date | string, forSale: boolean} | undefined>} The item. Will reject if the user does not have sufficient permission.
 * @throws {TypeError} Throws a {@link TypeError} when the ID is less than 0 or is not a number.
 * @throws {TypeError} Throws a {@link TypeError} when username is not a valid username.
 * @throws {TypeError} Throws a {@link TypeError} when the pool is invalid.
 * @example
 * ```JS
 * import { createPool, getItemFromID } from "../opt/nodejs/index.mjs";
 * let pool;
 * try {
 *      pool = await createPool();
 * } catch (error) {
 *      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
 *      return { statusCode: 500, error: "Could not make database connection" };
 * }
 * 
 * try {
 *      // Seller
 *      const item = await getItemFromID(14, pool, "DummySeller").catch((error) => return resolve({statusCode: 403, error: "Insufficient Permission to view this item"}));
 *      // Or...
 *      // Customer
 *      const item = await getItemFromID(14, pool).catch((error) => return resolve({statusCode: 403, error: error}));
 * } catch (error) {
 *      console.error(error);
 *      // Handle error here
 * } finally {
 *      // Close the connection
 *      pool.end((err) => {
 *          if (err) {
 *              console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
 *          }
 *      });
 * }
 * ```
 */
export async function getItemFromID(id, pool, username = undefined) {
    if ((typeof id !== 'number' || isNaN(id)) && isNaN(Number.parseInt(id))) throw new TypeError(`ID must be a number. Instead recieved "${+id}" of type ${typeof +id} (${id} of type ${typeof id})`);
    if (+id < 0) throw new TypeError("ID must be greater than 0! Instead recieved " + id);

    if (username !== undefined && typeof username !== 'string') {
        throw new TypeError("username is an invalid type! Recieved " + accountType + " of type " + typeof accountType);
    }

    // Validate pool
    if (pool === undefined || pool === null) {
        const error = new TypeError('pool parameter is not defined.');
        console.error(error);
        throw error;
    }

    return new Promise(async (resolve, reject) => {
        /**
         * @type {"Admin" | "Seller" | "Buyer" | undefined}
         */
        const accountType = username ? (await getAccountByUsername(username, pool)).accountType : undefined; // POTENTIAL BUG: Putting the await within the parenthesis and then accessing a member may cause issues...

        // Valid username and pool at this point
        const foundItem = await _getItemFromIDNoChecks(+id, pool);

        // Return undefined if the item was not found
        if (foundItem === undefined) {
            console.log("No item found");
            return resolve(undefined);
        }

        // Check if item is active
        const isActive = foundItem.status === "Active";
        console.log(foundItem)

        if (accountType === "Admin") {
            return reject("Admins cannot view items.");
        }
        // Check if user has permissions to get the bids
        if (username === undefined && !isActive) {
            // No permission to view item.
            return reject("Customers cannot view items that are not active.");
        }

        if (foundItem.archived && accountType === undefined) {
            // Item has been archived. Pretend it doesn't exist.
            return reject("Customers cannot view archived items.");
        }

        if (accountType === "Seller" && foundItem['seller_username'] !== username) {
            // Sellers are only allowed to access their own items
            return reject("Permission denied. This is not your item.");
        }

        if (accountType === undefined && isActive) {
            // The item is active. Show the item with least information (no bids).
            return resolve({
                id: foundItem.id,
                name: foundItem.name,
                description: foundItem.description,
                image: foundItem.image,
                price: foundItem?.price || foundItem.initialPrice,
                startDate: foundItem.startDate,
                endDate: foundItem.endDate,
                forSale: foundItem.forSale // THIS MIGHT NOT BE THE CASE, CUSTOMER MIGHT NOT BE ALLOWED TO SEE THIS.
            });
        }

        /**
         * The buffer period for which a Buyer is allowed to see recently sold items.
         * @type {number}
         */
        const BUYER_BUFFER_IN_HOURS = 24;
        const BUYER_VIEWABLE_ITEM_STATUSES = ["Active", "Completed", "Fulfilled"];

        /**
         * @returns {boolean} A flag representing if the item was completed within {@link BUYER_BUFFER_IN_HOURS} hours.
         */
        const withinBuyerBuffer = () => {
            const BUFFER_IN_MS = BUYER_BUFFER_IN_HOURS * 60 * 60 * 1000;

            /**
             * {@type Date | undefined}
             */
            const itemDate = typeof foundItem.endDate === 'string' ? new Date(foundItem.endDate) : foundItem.endDate;

            // Assume that if the date is invalid, it is not within the buyer's buffer
            if (itemDate === undefined) return false;

            const difference = itemDate.getTime() - new Date().getTime();

            // The item's end time - the current time should be greater than or equal to the buffer
            // If the difference is smaller than the buffer, it has been over BUYER_BUFFER_IN_HOURS ms.
            // If the difference is greater than the buffer, it either A) is over and within the buffer or B has not reached the end date.
            return difference >= -BUFFER_IN_MS;
        }

        // At this point there is only Buyer and Seller
        const inBuffer = withinBuyerBuffer();
        if (accountType === "Buyer" && (!inBuffer || (inBuffer && !BUYER_VIEWABLE_ITEM_STATUSES.includes(foundItem.status)))) {
            // Not an item within the buyer buffer period
            return reject("Permission denied. It has been more than " + BUYER_BUFFER_IN_HOURS + " hours since this item has been completed.");
        }

        return resolve(foundItem);
    });
}