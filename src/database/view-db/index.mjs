import { createPool, verifyToken } from "../opt/nodejs/index.mjs";

/**
 * @param {{tableName: string, token: string}} event The view-db event
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

    const { tableName, token } = event;

    // Type check all args
    if (typeof tableName !== 'string') {
        const error = new TypeError('Invalid tableName parameter. Expected a string.');
        console.error(error);
        return { statusCode: 500, error: error.message };
    }

    // Verify the token
    try {
        const { username, accountType } = await verifyToken(token);
        if (!username || !accountType) {
            return { statusCode: 401, error: "Invalid token" }
        }

        if (accountType !== "Admin") {
            return { statusCode: 403, error: "It is forbidden to perform this operation." }
        }
    } catch (error) {
        return { statusCode: 400, error: typeof error === 'string' ? error : JSON.stringify(error) }
    }

    return new Promise((resolve) => {
        // Proceed with displaying data
        const displayQuery = `
            SELECT * FROM ??
            `;
        console.log('Executing display query:', displayQuery);

        pool.query(displayQuery, [tableName], (displayError, displayResults) => {
            pool.end();
            if (displayError) {
                console.error('display query error:', displayError);
                return resolve({ statusCode: 500, error: error instanceof Error ? error.message : JSON.stringify(error)});
            }

            console.log('display query results:', displayResults);
            return resolve({
                statusCode: 200,
                body: JSON.stringify(displayResults),
            });

        });
    });
};