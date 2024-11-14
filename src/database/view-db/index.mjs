import { createPool } from "../opt/nodejs/index.mjs";

/**
 * @param {{tableName: string}} event
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

    const { tableName } = event;

    return new Promise((resolve, reject) => {
        // Type check all args
        if (typeof tableName !== 'string') {
            const error = new TypeError('Invalid tableName parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }

        // Proceed with displaying data
        const displayQuery = `
            SELECT * FROM ${tableName}
            `;
        console.log('Executing display query:', displayQuery);

        pool.query(displayQuery, (displayError, displayResults) => {

            if (displayError) {
                console.error('display query error:', displayError);
                return reject(displayError);
            } else {
                console.log('display query results:', displayResults);
                pool.end();
                return resolve({
                    statusCode: 200,
                    body: JSON.stringify(displayResults),
                });
            }
        });
    });
};