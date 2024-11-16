import { createPool, getUsernameFromToken, getItemFromID } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{token: string, item_id: number}} event id of item to publish, and if it should be forSale
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
    const item = await getItemFromID(item_id, pool, username)

    // if item status is not Active can not unpublish
    if (item.status != 'Active') {
        return { statusCode: 400, error: "Cannot publish an item if it is Active" };
    }

    // can not unpublish items with bids
    const bidQuery = 'SELECT * FROM Bid WHERE item_id = ?';

    const bidResults = await new Promise((resolve, reject) => {
        pool.query(bidQuery, [item_id], (error, results) => {
            if (error) return reject(error);
            return resolve(results);
        });
    });

    if (bidResults.length > 0) {
        return { statusCode: 400, error: "Cannot unpublish an item with bids" };
    }

    // proceed to unpublish
    return new Promise((resolve, reject) => {

        const localQuery = `
            UPDATE Item
            SET status = 'Inactive', forSale = 0
            WHERE id = ?;
            `;

        pool.query(localQuery, [item_id], (err) => {
            if (err) return reject(err);
            return resolve({ statusCode: 200, item_id });
        });
    });
}