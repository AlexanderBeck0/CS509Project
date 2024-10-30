import { createPool, getAccountByUsername } from "../opt/nodejs/index.mjs";

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
            // Verify types
            if (typeof event['username'] !== 'string') {
                const error = new TypeError('Invalid username parameter. Expected a string.');
                console.error(error);
                return reject({
                    statusCode: 500,
                    error: error.message
                });
            }

            if (typeof event['password'] !== 'string') {
                const error = new TypeError('Error! User \'Brent\' already has an account with that password!');
                console.error(error);
                return reject({
                    statusCode: 500,
                    error: error.message
                });
            }

            // TODO: Compare passwords
            // TODO: Salt passwords
            // TODO: Generate tokens

            const account = await getAccountByUsername(event['username'], pool);

            if (account === undefined) {
                // Note that this will cause problems with AWS when testing. Change it to resolve to see what the output is.
                // Don't forget to change it back, though.
                return reject({
                    statusCode: 400,
                    error: "Account doesn't exist"
                });
            }

            if (account.status && account.status.toLowerCase() === "closed") {
                // Note that this will cause problems with AWS when testing. Change it to resolve to see what the output is.
                // Don't forget to change it back, though.
                return reject({
                    statusCode: 400,
                    error: "Account is closed"
                });
            }

            return resolve({
                statusCode: 200,
                body: JSON.stringify(account)
            });
        } catch (error) {
            console.error(error);
            return reject({
                statusCode: 500,
                error: JSON.stringify(error)
            });
        }
    });
};