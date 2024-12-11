import { createPool } from "../opt/nodejs/index.mjs";

export const handler = async () => {
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

    try {
        // get active or frozen items that have an expired enddate and bids
        const getActiveItemsWithBidsQuery = `
        SELECT Item.* 
        FROM Item 
        JOIN Bid ON Item.id = Bid.item_id 
        WHERE Item.endDate < NOW() AND Item.status IN ('Active', 'Frozen', 'Requested')`;

        console.log('getActiveItemsWithBidsQuery:', getActiveItemsWithBidsQuery);

        const completeItemsResults = await new Promise((resolve, reject) => {
            pool.query(getActiveItemsWithBidsQuery, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
        console.log('getActiveItemsWithBidsQuery results:', completeItemsResults);

        // Update active expired items with bids to be Completed
        if (completeItemsResults.length > 0) {
            const itemIds = completeItemsResults.map(item => item.id);
            const updateItemsQuery = `
            UPDATE Item
            SET status = 'Completed'
            WHERE id IN (?)`;

            const updateIemsResults = await new Promise((resolve, reject) => {
                pool.query(updateItemsQuery, [itemIds], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                    console.log('Items status updated to completed for item IDs:', itemIds);
                });
            });
            console.log('Update Completed Items Query Results:', updateIemsResults);
        }

        // get active items or frozen items that have an expired enddate and no bids
        const getActiveItemsWithoutBidsQuery = `
        SELECT Item.* 
        FROM Item 
        LEFT JOIN Bid ON Item.id = Bid.item_id 
        WHERE Item.endDate < NOW() AND Item.status IN ('Active', 'Frozen', 'Requested') AND Bid.item_id IS NULL`;

        const failedItemsResults = await new Promise((resolve, reject) => {
            pool.query(getActiveItemsWithoutBidsQuery, async (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        // Update expired active items with no bids to be Failed
        if (failedItemsResults.length > 0) {
            const itemIds = failedItemsResults.map(item => item.id);
            const failItemsQuery = `
            UPDATE Item 
            SET status = 'Failed' 
            WHERE id IN (?)`;

            const failedItemResults = await new Promise((resolve, reject) => {
                pool.query(failItemsQuery, [itemIds], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                    console.log('Items status updated to Failed for item IDs:', itemIds);
                });
            });
            console.log('Update Failed Items Query Results:', failedItemResults);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return { statusCode: 500, error: error.message };
    } finally {
        // Close the pool's connection
        pool.end();
    }
};