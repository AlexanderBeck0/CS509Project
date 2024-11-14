import { createPool, getAccountByUsername, getUsernameFromToken } from "../opt/nodejs/index.mjs";

/**
 * @param {{token: string}} event The close account event
 */
export const handler = async (event) => {
    let pool;

    try {
        pool = await createPool();
    } catch (error) {
        console.error("Failed to create MySQL Pool. Error: ", error);
        return { statusCode: 500, error: "Could not make database connection"  };
    }

    try {
        const { token } = event;

        // Verify types
        if (typeof token !== 'string') {
            const error = new TypeError('Invalid token parameter. Expected a string.');
            console.error(error);
            return { statusCode: 400, error: error.message };
        }

        const username = await getUsernameFromToken(token);
        console.log("USERNAME", username);
        const account = await getAccountByUsername(username, pool);
        console.log(account);

        if (!account) {
            return { statusCode: 400, error: "Account doesn't exist"  };
        }

        if (account.accountType === 'Admin') {
            return { statusCode: 400,  error: "Cannot close an Admin account" };
        }

        const closedQuery = `SELECT isActive FROM Account WHERE username = ?`;
        console.log('Executing closed query:', closedQuery);

        const checkResults = await new Promise((resolve, reject) => {
            pool.query(closedQuery, [username], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        const isActive = checkResults[0]?.isActive;
        if (isActive === 0) {
            const error = new Error('This user is already a closed account');
            console.error(error);
            return { statusCode: 400,  error: error.message  };
        }

        const bidQuery = `
            SELECT COUNT(*) as bidCount 
            FROM Bid 
            JOIN Item ON Bid.item_id = Item.id
            WHERE Bid.buyer_username = ?
            AND Item.status = 'Active'
        `;
        console.log('Executing bid query:', bidQuery);

        const bidResults = await new Promise((resolve, reject) => {
            pool.query(bidQuery, [username], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        const bidCount = bidResults[0]?.bidCount;
        if (bidCount > 0) {
            const error = new Error('You cannot close an account with Active bids');
            console.error(error);
            return { statusCode: 400, error: error.message  };
        }

        const itemQuery = `
            SELECT COUNT(*) as itemCount 
            FROM Item 
            WHERE seller_username = ?
            AND status = 'Active'
        `;
        console.log('Executing item query:', itemQuery);

        const itemResults = await new Promise((resolve, reject) => {
            pool.query(itemQuery, [username], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        const itemCount = itemResults[0]?.itemCount;
        if (itemCount > 0) {
            const error = new Error('You cannot close an account with Active items');
            console.error(error);
            return { statusCode: 400, error: error.message };
        }

        const closeQuery = `
            UPDATE Account 
            SET isActive = 0
            WHERE username = ?
        `;
        console.log('Executing close query:', closeQuery);

        const closeResults = await new Promise((resolve, reject) => {
            pool.query(closeQuery, [username], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        console.log('Close query results:', closeResults);

        return {
            statusCode: 200,
             valid: true 
        };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { statusCode: 500, error: error.message };
    } finally {
        // Close the pool's connection
        pool.end();
    }
};