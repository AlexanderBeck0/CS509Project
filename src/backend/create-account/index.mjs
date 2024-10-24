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
    const password = event.password;
    const accountType = event.accountType;

    return new Promise((resolve, reject) => {
        // Type check all args
        if (typeof username !== 'string') {
            const error = new TypeError('Invalid username parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }
        if (typeof password !== 'string') {
            const error = new TypeError('Invalid password parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }
        if (typeof accountType !== 'string') {
            const error = new TypeError('Invalid accountType parameter. Expected a string.');
            console.error(error);
            return reject(error);
        }

        // Check if username already exists
        const checkQuery = `SELECT status FROM ${mysql.escapeId(accountType)} WHERE username = ${mysql.escape(username)}`;
        console.log('Executing check query:', checkQuery);
        pool.query(checkQuery, (checkError, checkResults) => {
            if (checkError) {
                console.error('Check query error:', checkError);
                return reject(checkError);
            }

            if (checkResults.length > 0) {
                const status = checkResults[0].status;
                if (status === 'closed') {
                    const error = new Error('This user has permanently closed an account with that username.');
                    console.error(error);
                    return reject(error);
                } else {
                    const error = new Error('Username already exists. Please choose a different username.');
                    console.error(error);
                    return reject(error);
                }
            }

            // Proceed with insertion
            const insertQuery = `
                INSERT INTO ${mysql.escapeId(accountType)} (username, password, status, funds)
                VALUES (${mysql.escape(username)}, ${mysql.escape(password)}, 'active', 0)
            `;
            console.log('Executing insert query:', insertQuery);
            pool.query(insertQuery, (insertError, insertResults) => {
                if (insertError) {
                    console.error('Insert query error:', insertError);
                    return reject(insertError);
                } else {
                    console.log('Insert query results:', insertResults);
                    return resolve({
                        statusCode: 200,
                        body: JSON.stringify(insertResults),
                    });
                }
            });
        });
    });
};