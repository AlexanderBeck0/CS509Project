import mysql from 'mysql';
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
        console.error("Failed to create MySQL Pool. Error: ", error);
        return { statusCode: 500, error: "Could not make database connection" };
    }

    return new Promise(async (resolve) => {
        try {
            // Verify types
            if (typeof event.username !== 'string') {
                const error = new TypeError('Invalid username parameter. Expected a string.');
                console.error(error);
                return resolve({
                    statusCode: 400,
                    error: error.message
                });
            }

            const username = event.username;
            const account = await getAccountByUsername(username, pool);

            if (account === undefined) {
                // Note that this will cause problems with AWS when testing. Change it to resolve to see what the output is.
                // Don't forget to change it back, though.
                return resolve({
                    statusCode: 400,
                    error: "Account doesn't exist"
                });
            }

            if (account.accountType === 'Admin') {
                return resolve({
                    statusCode: 400,
                    error: "Cannot close an Admin account"
                });
            }

            const closedQuery = `SELECT isActive FROM Account WHERE username = ${mysql.escape(username)}`;
            console.log('Executing closed query:', closedQuery);

            pool.query(closedQuery, (checkError, checkResults) => {
                if (checkError) {
                    console.error('Check query error:', checkError);
                    return resolve({ statusCode: 500, error: checkError.message });
                }

                const isActive = checkResults[0]?.isActive;
                if (isActive === 0) {
                    const error = new Error('This user is already a closed account');
                    console.error(error);
                    return resolve({ statusCode: 400, error: error.message });
                }

                const bidQuery = `
          SELECT COUNT(*) as bidCount 
          FROM Bid 
          JOIN Item ON Bid.item_id = Item.id
          WHERE Bid.buyer_username = ${mysql.escape(username)} 
          AND Item.status = 'Active'
        `;
                console.log('Executing bid query:', bidQuery);

                pool.query(bidQuery, (bidError, bidResults) => {
                    if (bidError) {
                        console.error('Bid query error:', bidError);
                        return resolve({ statusCode: 500, error: bidError.message });
                    }

                    const bidCount = bidResults[0]?.bidCount;
                    if (bidCount > 0) {
                        const error = new Error('You cannot close an account with Active bids');
                        console.error(error);
                        return resolve({ statusCode: 400, error: error.message });
                    }

                    const itemQuery = `
            SELECT COUNT(*) as itemCount 
            FROM Item 
            WHERE seller_username = ${mysql.escape(username)} 
            AND status = 'Active'
          `;
                    console.log('Executing item query:', itemQuery);

                    pool.query(itemQuery, (itemError, itemResults) => {
                        if (itemError) {
                            console.error('Item query error:', itemError);
                            return resolve({ statusCode: 500, error: itemError.message });
                        }

                        const itemCount = itemResults[0]?.itemCount;
                        if (itemCount > 0) {
                            const error = new Error('You cannot close an account with Active items');
                            console.error(error);
                            return resolve({ statusCode: 400, error: error.message });
                        }

                        const closeQuery = `
                        UPDATE Account 
                        SET isActive = 0
                        WHERE username = ${mysql.escape(username)}
                        `;
                        console.log('Executing close query:', closeQuery);

                        pool.query(closeQuery, (closeError, closeResults) => {
                            if (closeError) {
                                console.error('Close query error:', closeError);
                                return resolve({ statusCode: 500, error: closeError.message });
                            }

                            console.log('Close query results:', closeResults);
                            resolve({
                                statusCode: 200,
                                body: JSON.stringify({ message: 'Account successfully closed', results: closeResults }),
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            resolve({ statusCode: 500, error: error.message });
        }
    });
};
