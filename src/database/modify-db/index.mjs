import { createPool, verifyToken } from "../opt/nodejs/index.mjs";

/**
 * @param {{sqlCommand: string, token: string}} event
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

    const { sqlCommand, token } = event;

    // Type check all args
    if (typeof sqlCommand !== 'string') {
        const error = new TypeError('Invalid sql command parameter. Expected a string.');
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
    
    if (sqlCommand.toUpperCase().includes('DROP')) {
        return { statusCode: 403, error: "It is forbidden to perform this operation." }
    }

    return new Promise((resolve) => {
        // Proceed with query
        console.log('Executing modifcation query:', sqlCommand);

        // Capital callback parameters are cursed
        pool.query(sqlCommand, (error, results) => {
            pool.end();
            if (error) {
                console.error('query error:', error);
                return resolve({ statusCode: 500, error: error instanceof Error ? error.message : JSON.stringify(error)});
            }
            console.log('query results:', results);
            return resolve({
                statusCode: 200,
                body: JSON.stringify(results),
            });
        });
    });
};