import { createPool, getUsernameFromToken, getItemFromID } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{token: string, item_id: number, forSale: boolean}} event id of item to publish, and if it should be forSale
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

    const { token, item_id, forSale } = event;
    try {
        // make sure user is seller of this item
        const username = await getUsernameFromToken(token)
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

        // if item status is active, can not publish
        if (item.status != 'Inactive') {
            return { statusCode: 400, error: "Cannot publish an item if it is not inactive" };
        }

        // if endDate is after now then can not be published
        // console.log("endDate", item.endDate)
        // console.log("endDate:", new Date(item.endDate), "Current Date: ", new Date())
        if (!item.endDate || item.endDate === '0000-00-00 00:00:00' || new Date(item.endDate) <= new Date()) {
            return { statusCode: 400, error: "Cannot publish an item if the end date has passed or is invalid" };
        }

        return await new Promise((resolve, reject) => {

            const localQuery = `
            UPDATE Item
            SET status = 'Active', forSale = ?, startDate = NOW()
            WHERE id = ?;
            `;

            pool.query(localQuery, [forSale, item_id], (err) => {
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