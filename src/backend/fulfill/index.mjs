import { createPool, getUsernameFromToken, getItemFromID } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{token: string, item_id: number}} event token of seller and id of item to fulfill 
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
        const username = await getUsernameFromToken(token)
        const checkSellerQuery = 'SELECT seller_username FROM Item WHERE id = ?';

        const sellerQueryResults = await new Promise((resolve, reject) => {
            pool.query(checkSellerQuery, [item_id], (error, results) => {
                if (error) return reject(error);
                return resolve(results);
            });
        });;

        if (sellerQueryResults[0]['seller_username'] !== username) {
            return { statusCode: 400, error: "You do not own this item" };
        }

        //get the item
        const item = await getItemFromID(item_id, pool, username).catch((error) => {
            return { statusCode: 403, error: "Insufficient Permission to view this item", error };
        });

        // if item status is not completed
        if (item.status !== 'Completed') {
            return { statusCode: 400, error: "Cannot fulfill an item that has not completed" };
        }

        // get the buyer account of the bid with the most recent timeOfBid on the item
        const getBuyerAccountQuery = `
        SELECT buyer_username
        FROM Bid
        WHERE item_id = ?
        ORDER BY timeOfBid DESC
        LIMIT 1;
        `;

        const buyerAccountResults = await new Promise((resolve, reject) => {
            pool.query(getBuyerAccountQuery, [item_id], (error, results) => {
                if (error) return reject(error);
                return resolve(results);
            });
        });

        if (buyerAccountResults.length === 0) {
            return { statusCode: 404, error: "No bids found for this item" };
        }

        const buyerUsername = buyerAccountResults[0]['buyer_username'];
        const itemPrice = item.price;

        // remove funds from buyer account
        const removeFundsQuery = `
        UPDATE Account
        SET balance = balance - ?
        WHERE username = ?;
        `;

        await new Promise((resolve, reject) => {
            pool.query(removeFundsQuery, [itemPrice, buyerUsername], (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });

        // add 95% of the price to the seller balance
        const addFundsToSellerQuery = `
        UPDATE Account
        SET balance = balance + ?
        WHERE username = ?;
        `;

        await new Promise((resolve, reject) => {
            pool.query(addFundsToSellerQuery, [itemPrice * 0.95, username], (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });

        // add 5% of the price to admin1 balance
        const addFundsToAdminQuery = `
        UPDATE Account
        SET balance = balance + ?
        WHERE username = 'admin1';
        `;

        await new Promise((resolve, reject) => {
            pool.query(addFundsToAdminQuery, [itemPrice * 0.05], (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });

        return await new Promise((resolve, reject) => {

            const localQuery = `
            UPDATE Item
            SET status = 'Fulfilled', archived = true
            WHERE id = ?;
            `;

            pool.query(localQuery, [item_id], (err) => {
                if (err) return reject(err);
                return resolve({ statusCode: 200, item_id });
            });
        });
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            error: error.message
        };
    } finally {
        // Close the pool's connection
        pool.end();
    }
}