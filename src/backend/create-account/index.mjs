import bcrypt from 'bcryptjs';
import { createPool } from "../opt/nodejs/index.mjs";

/**
 * Uses 10 salts to hash a password.
 * @param {string} password The password to hash.
 * @returns {Promise<string>} A hashed password.
 */
async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const saltCount = 10;
        bcrypt.hash(password, saltCount, function (err, hash) {
            if (err) return reject(err);
            return resolve(hash);
        });
    });
}

/**
 * @param {{username: string, password: string, accountType: string}} event The login event.
 */
export const handler = async (event) => {
    /**
     * @type {mysql.Pool}
     */
    let pool;

    try {
        pool = await createPool();
    } catch (error) {
        console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
        return { statusCode: 500, error: "Could not make database connection" };
    }

    const { username, password, accountType } = event;

    return new Promise((resolve, reject) => {
        // Type check all args
        if (typeof username !== 'string') {
            const error = new TypeError('Invalid username parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }
        if (typeof password !== 'string') {
            const error = new TypeError('Invalid password parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }
        if (typeof accountType !== 'string') {
            const error = new TypeError('Invalid accountType parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }

        // Check if username already exists
        const checkQuery = `SELECT isActive FROM Account WHERE username = ?`;
        console.log('Executing check query:', checkQuery);
        pool.query(checkQuery, [username], async (checkError, checkResults) => {
            if (checkError) {
                console.error('Check query error:', checkError);
                return reject(checkError);
            }

            if (checkResults.length > 0) {
                const isActive = checkResults[0].isActive;
                if (isActive === 'closed') {
                    const error = new Error('This user has permanently closed an account with that username.');
                    console.error(error);
                    return reject(error);
                } else {
                    const error = new Error('Username already exists. Please choose a different username.');
                    console.error(error);
                    return reject(error);
                }
            }

            // Proceed with insertion
            const insertQuery = `
                INSERT INTO Account (username, password, accountType, isActive, balance)
                VALUES (?, ?, ?, True, 0)
            `;
            console.log('Executing insert query:', insertQuery);

            const hashedPassword = await hashPassword(password);
            pool.query(insertQuery, [username, hashedPassword, accountType], (insertError, insertResults) => {

                if (insertError) {
                    console.error('Insert query error:', insertError);
                    return reject(insertError);
                } else {
                    console.log('Insert query results:', insertResults);
                    return resolve({
                        statusCode: 200,
                        body: JSON.stringify(insertResults),
                    });
                }
            });
        });
    });
};