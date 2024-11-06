import { createPool, verifyToken, getAccountByUsername } from "../opt/nodejs/index.mjs";

/**
 * @param {{token: string, deltaBalance: number}} event 
 */
export const handler = async (event) => {
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
    const { token, deltaBalance } = event
    const { username, accountType } = await verifyToken(token)
    // get account information
    const account = await getAccountByUsername(username, pool, false);
    // get balance
    const curBalance = account.balance
    // define new balance
    const newBalance = deltaBalance + curBalance

    return new Promise((resolve, reject) => {
        // make sure newBalance is not negative
        if (newBalance <= 0) {
            return reject(new Error("New balance cannot be less than zero"));
        }
        // make sure balance is a whole number
        if (!Number.isInteger(newBalance)) {
            return reject(new Error("New balance must be a whole number"))
        }

        // make sure account is active
        if (account.isActive !== 1) {
            return reject(new Error("Account must be active to edit balance"))
        }


        const updateBalanceQuery = "UPDATE Account SET balance = ? WHERE username = ?";

        // check if account type is buyer
        if (accountType === 'Buyer') {
            const addFundsQuery = updateBalanceQuery
            console.log('Executing add funds query:', addFundsQuery);
            pool.query(addFundsQuery, [newBalance, username], async (fundsError) => {

                if (fundsError) {
                    console.error('funds query error:', fundsError);
                    return reject(fundsError);
                } else {
                    // successful
                    return resolve({
                        statusCode: 200,
                        body: {
                            token,
                            newBalance
                        }
                    });
                }
            });
            // check if account type is seller
            if (accountType === 'Seller') {
                // make sure deltaBalance is positive
                if (deltaBalance < 0) {
                    return reject(new Error("Delta balance must be positive for sellers"));
                }

                const addProfitQuery = updateBalanceQuery
                console.log('Executing add profit query:', addProfitQuery);
                pool.query(addProfitQuery, [newBalance, username], async (profitError) => {

                    if (profitError) {
                        console.error('profit query error:', profitError);
                        return reject(profitError);
                    } else {
                        // successful
                        return resolve({
                            statusCode: 200,
                            body: {
                                newBalance
                            }
                        });
                    }
                });
            }
        }
    });
};