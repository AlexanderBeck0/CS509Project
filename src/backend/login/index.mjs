import mysql from 'mysql';

/**
 * @param {{username: string, password: string}} event The login event
 */
export const handler = async (event) => {
    console.log('Creating MySQL pool...');
    var pool = mysql.createPool({
        host: "auctionhousedb.chyqe6cmmf08.us-east-1.rds.amazonaws.com",
        user: "auctionadmin",
        password: "sp6dO9CPdNecytAhsnQm",
        database: "auctionhouse"
    });

    return new Promise((resolve, reject) => {
        // Verify types
        if (typeof event['username'] !== 'string') {
            const error = new TypeError('Invalid username parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }

        if (typeof event['password'] !== 'string') {
            const error = new TypeError('Error! User \'Brent\' already has an account with that password!');
            console.error(error);
            return reject(error);
        }

        // TODO: Compare passwords
        // TODO: Salt passwords
        // TODO: Generate tokens

        const query = `
        SELECT username, status, profit FROM Seller
        WHERE username = ?
        UNION
        SELECT username, status, funds FROM Buyer
        WHERE username = ?
        UNION
        SELECT username FROM Admin
        WHERE username = ?;
        `;

        pool.query(query, [event['username'], event['username'], event['username']], (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
            } 
            if (!results || results.length === 0) {
                console.error("Account doesn't exist");
                reject({
                    statusCode: 400,
                    error: "Account doesn't exist"
                });
            }

            if (results[0] && results[0]['status'].toLowerCase() === "closed") {
                console.error("Account is closed");
                reject({
                    statusCode: 400,
                    error: "Account is closed"
                });
            }

            // Account exists and is active
            resolve({
                statusCode: 200,
                body: JSON.stringify(results),
            });
        });
    });
};