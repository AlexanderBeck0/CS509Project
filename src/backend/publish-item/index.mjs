import { createPool } from "../opt/nodejs/index.mjs";

/**
 * @param {number} id the id of item to get status of
 * @param {mysql.Pool} pool The pool to get the item from
 */
async function getStatusFromID(id, pool) {
    const localQuery = `
    SELECT status FROM Item
    WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        pool.query(localQuery, [id], (err, results) => {
            if (err) return reject(err);
            return resolve(results[0]['status']);
        });
    });
}

/**
 * @param {number} id the id of item to get endDate of
 * @param {mysql.Pool} pool The pool to get the item from
 */
async function getEndDateFromID(id, pool) {
    const localQuery = `
    SELECT endDate FROM Item
    WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        pool.query(localQuery, [id], (err, results) => {
            if (err) return reject(err);
            return resolve(results[0]['endDate']);
        });
    });
}


/**
 * 
 * @param {{item_id: number, forSale: boolean}} event id of item to publish, and if it should be forSale
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

    const { item_id, forSale } = event;

    // get the status of the item
    const status = await getStatusFromID(item_id, pool)
    // if item status is active, can not publish
    if (status != 'Inactive') {
        return { statusCode: 400, error: "Cannot publish an item if it is not inactive" };
    }

    // get endDate of item
    const endDate = await getEndDateFromID(item_id, pool)
    // if endDate is after now then can not be published
    if (!endDate || endDate === '0000-00-00 00:00:00' || new Date(endDate) <= new Date()) {
        return { statusCode: 400, error: "Cannot publish an item if the end date has passed or is invalid" };
    }

    return new Promise((resolve, reject) => {

        const localQuery = `
            UPDATE Item
            SET status = 'Active', forSale = ?, startDate = NOW()
            WHERE id = ?;
            `;

        pool.query(localQuery, [forSale, item_id], (err, results) => {
            if (err) return reject(err);
            return resolve({ statusCode: 200, item_id, changedRows: results.changedRows });
        });
    });
}