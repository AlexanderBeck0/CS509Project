import { createPool, getItemFromID, verifyToken } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{token: string, item_id: number}} event token of user, id of item to remove
 * @returns 
 */
export const handler = async (event) => {
    let pool;

    try {
        pool = await createPool();
    } catch (error) {
        console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
        return { statusCode: 500, error: "Could not make database connection" };
    }

    const { token, item_id } = event;
    try {
        // make sure user is seller of this item
        const { username } = await verifyToken(token).catch(error => {
            if (error.name === 'TokenExpiredError') return {
                statusCode: 400,
                error: "Your token has expired. Please log in again."
            }
        });
        const checkSellerQuery = 'SELECT seller_username FROM Item WHERE id = ?';

        const sellerQueryResults = await new Promise((resolve, reject) => {
            pool.query(checkSellerQuery, [item_id], (error, results) => {
                if (error) return reject(error);
                return resolve(results);
            });
        });
        // console.log('Seller Query Results:', sellerQueryResults[0]);

        if (sellerQueryResults[0]['seller_username'] !== username) {
            return { statusCode: 400, error: "You do not own this item" };
        }

        //get the item
        const item = await getItemFromID(item_id, pool, username).catch((error) => {
            return { statusCode: 403, error: "Insufficient Permission to view this item", error };
        });

        // if item status is not inactive can not remove
        if (item.status !== 'Inactive') {
            return { statusCode: 400, error: "Cannot publish an item if it is Active" };
        }

        // proceed to remove ietm
        return await new Promise((resolve, reject) => {
            const localQuery = `
            DELETE FROM Item
            WHERE id = ?;
            `;

            pool.query(localQuery, [item_id], (err) => {
                if (err) return reject(err);
                return resolve({ statusCode: 200, item_id });
            });
        });
    } catch (error) {
        console.error(error);
        return reject({
            statusCode: 500,
            error: error.message
        });
    } finally {
        // Close the pool's connection
        pool.end();
    }
}