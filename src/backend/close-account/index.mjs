import mysql from 'mysql';

export const handler = async (event) => {
    console.log('Creating MySQL pool...');
    var pool = mysql.createPool({
        host: "auctionhousedb.chyqe6cmmf08.us-east-1.rds.amazonaws.com",
        user: "auctionadmin",
        password: "sp6dO9CPdNecytAhsnQm",
        database: "auctionhouse"
    });

    const username = event.username;

    return new Promise((resolve, reject) => {
        // Type check all args
        if (typeof username !== 'string') {
            const error = new TypeError('Invalid username parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }

        // Check if username already exists
        const typeQuery = `
            SELECT 'Buyer' as accountType FROM Buyer WHERE username = ${mysql.escape(username)}
            UNION 
            SELECT 'Seller' as accountType FROM Seller WHERE username = ${mysql.escape(username)}
        `;
        console.log('Executing type query:', typeQuery);
        pool.query(typeQuery, (typeError, typeResults) => {
            if (typeError) {
                console.error('Type query error:', typeError);
                return reject(typeError);
            }

            if (typeResults.length === 0) {
                const error = new Error('User not found in Buyer or Seller tables');
                console.error(error);
                return reject(error);
            }

            const accountType = typeResults[0].accountType;

            const closedQuery = `SELECT status FROM ${mysql.escapeId(accountType)} WHERE username = ${mysql.escape(username)}`;
            console.log('Executing closed query:', closedQuery);
            pool.query(closedQuery, (checkError, checkResults) => {
                if (checkError) {
                    console.error('Check query error:', checkError);
                    return reject(checkError);
                }

                // Make sure account status is not already closed
                const status = checkResults[0].status;
                if (status === 'Closed') {
                    const error = new Error('This user is already a closed account');
                    console.error(error);
                    return reject(error);
                }

                // Check if user has Active bids
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
                        return reject(bidError);
                    }

                    const bidCount = bidResults[0].bidCount;
                    if (bidCount > 0) {
                        const error = new Error('You cannot close an account with Active bids');
                        console.error(error);
                        return reject(error);
                    }

                    // Check if user has Active items
                    const itemQuery = `SELECT COUNT(*) as itemCount FROM Item WHERE seller_username = ${mysql.escape(username)} AND itemStatus = 'Active'`;
                    console.log('Executing item query:', itemQuery);
                    pool.query(itemQuery, (itemError, itemResults) => {
                        if (itemError) {
                            console.error('Item query error:', itemError);
                            return reject(itemError);
                        }

                        const itemCount = itemResults[0].itemCount;
                        if (itemCount > 0) {
                            const error = new Error('You cannot close an account with Active items');
                            console.error(error);
                            return reject(error);
                        }

                        // Proceed with insertion
                        const closeQuery = `UPDATE ${mysql.escapeId(accountType)} SET status = 'Closed' WHERE username = ${mysql.escape(username)}`;
                        console.log('Executing insert query:', closeQuery);
                        pool.query(closeQuery, (closeError, closeResults) => {
                            if (closeError) {
                                console.error('Insert query error:', closeError);
                                return reject(closeError);
                            } else {
                                console.log('Insert query results:', closeResults);
                                return resolve({
                                    statusCode: 200,
                                    body: JSON.stringify(closeResults),
                                });
                            }
                        });
                    });
                });
            });
        });
    });
};