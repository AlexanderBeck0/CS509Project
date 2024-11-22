import bcrypt from 'bcryptjs';
import { createPool, generateToken, getAccountByUsername } from "../opt/nodejs/index.mjs";

/**
 * @param {string} username The username to get the password for. 
 * @param {mysql.Pool} pool The pool to get the username from. 
 * @returns {Promise<string>} The password.
 */
async function getPasswordFromUser(username, pool) {
    const localQuery = `
    SELECT username, password FROM Account
    WHERE username = ?
    `;
    return new Promise((resolve, reject) => {
        pool.query(localQuery, [username], (err, results) => {
            if (err) return reject(err);
            return resolve(results[0]['password']);
        });
    });
}

/**
 * @param {{username: string, password: string}} event The login event
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

    return new Promise(async (resolve, reject) => {
        try {
            const { username, password } = event;

            // Verify types
            if (typeof username !== 'string') {
                const error = new TypeError('Invalid username parameter. Expected a string.');
                console.error(error);
                return resolve({
                    statusCode: 500,
                    error: error.message
                });
            }

            if (typeof password !== 'string') {
                const error = new TypeError('Error! User \'Brent\' already has an account with that password!');
                console.error(error);
                return resolve({
                    statusCode: 500,
                    error: error.message
                });
            }

            const account = await getAccountByUsername(username, pool);

            if (account === undefined) {
                // This should be a reject, but AWS doesn't like that. Resolve instead.
                return resolve({
                    statusCode: 400,
                    error: "Account doesn't exist"
                });
            }

            if (!account.isActive) {
                // This should be a reject, but AWS doesn't like that. Resolve instead.
                return resolve({
                    statusCode: 400,
                    error: "Account is closed"
                });
            }
            // At this point we KNOW that the account exists. No need to handle the error
            const newPassword = await getPasswordFromUser(username, pool);
            const isMatch = await bcrypt.compare(password, newPassword);
            if (isMatch) {
                // Correct password
                const token = await generateToken(account);
                return resolve({
                    statusCode: 200,
                    body: {
                        token,
                        ...account
                    }
                });
            }

            // Incorrect password
            return resolve({
                statusCode: 400,
                error: "Incorrect password"
            })
        } catch (error) {
            console.error(error);
            return reject({
                statusCode: 500,
                error: error.message
            });
        } finally {
            // Close the pool's connection
            pool.end((err) => {
                if (err) {
                    console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
                }
            });
        }
    });
};