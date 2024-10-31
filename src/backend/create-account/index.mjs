import mysql from 'mysql';
import { createPool } from "../opt/nodejs/index.mjs";
import bcrypt from 'bcryptjs';

/**
 * @param {{username: string, password: string, accountType: string}} event The login event
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

    const username = event.username;
    let password = event.password;
    const accountType = event.accountType;

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
        const checkQuery = `SELECT isActive FROM Account WHERE username = ${mysql.escape(username)}`;
        console.log('Executing check query:', checkQuery);
        pool.query(checkQuery, async (checkError, checkResults) => {
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

            var salt = bcrypt.genSaltSync(10);
            var password = bcrypt.hashSync(process.env.HASH_PASS, salt);
            console.log("hashed password: ", password)
            // Proceed with insertion
            const insertQuery = `
                INSERT INTO Account (username, password, accountType, isActive, balance)
                VALUES (?, ?, ?, True, 0)
            `;
            console.log('Executing insert query:', insertQuery);
            pool.query(insertQuery, [username, password, accountType], (insertError, insertResults) => {

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