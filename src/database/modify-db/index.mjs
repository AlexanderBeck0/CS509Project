import { createPool } from "../opt/nodejs/index.mjs";

/**
 * @param {{sqlCommand: string}} event
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

    const { sqlCommand } = event;

    return new Promise((resolve, reject) => {
        // Type check all args
        if (typeof sqlCommand !== 'string') {
            const error = new TypeError('Invalid parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }

        // Proceed with query
        const localQuery = `${sqlCommand}`;
        console.log('Executing modifcation query:', localQuery);

        // Capital callback parameters are cursed
        pool.query(localQuery, (Error, Results) => {

            if (Error) {
                console.error('query error:', Error);
                return reject(Error);
            } else {
                console.log('query results:', Results);
                pool.end();
                return resolve({
                    statusCode: 200,
                    body: JSON.stringify(Results),
                });
            }
        });
    });
};