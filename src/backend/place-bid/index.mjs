import { createPool, getAccountByUsername, verifyToken, getItemFromID } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{id: string, token?: string}} event The get item event.
 */
export const handler = async (event) => {
  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  let makeBid = (bid, username, id) => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `
        INSERT INTO Bid
        VALUES (null, ?, NOW(), ?, ?)
      `;
      console.log("Query: "+sqlQuery);
      pool.query(sqlQuery, [bid, username, id], (error, rows) => {
        if (error) {
          console.log("DB error");
          return reject(error);
        }
  
        let updateQuery = `UPDATE Item SET price = ? WHERE id = ?`;
        console.log(updateQuery);
        pool.query(updateQuery, [(bid + 1), id], (error, rows) => {
          if (error) {
            console.log("DB error");
            return reject(error);
          }
          return resolve(rows);
        });
      });
    });
  }

  let buyItem = (id) => {
    return new Promise((resolve, reject) => {
      const updateItemStatusQuery = `UPDATE Item SET status = 'Completed' WHERE id = ?`;
      pool.query(updateItemStatusQuery, [id], (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }

  let getTotalBidCost = (username) => {
    return new Promise((resolve, reject) => {
      const sqlQuery = `SELECT SUM(bid) AS totalBidCost FROM MostRecentBids WHERE buyer_username = ?`;
        pool.query(sqlQuery, [username], (error, result) => {
            if (error) {
                return reject(error);
            }
            const totalBidCost = result[0].totalBidCost || 0; // Default to 0 if no bids
            return resolve(totalBidCost);
        });
    });
  }

  let response = undefined;
  try {
    
    let username = undefined;
    if (event.token) {
      const token = await verifyToken(event.token);
      username = token.username;
    }
    
    const item = await getItemFromID(Number.parseInt(event.id), pool, username);
    const account = await getAccountByUsername(username, pool);
    const totalBidCost = await getTotalBidCost(username);

    if (item.forSale && account.balance >= item.price+totalBidCost) {
      await makeBid(item.price, username, event.id);
      await buyItem(event.id);
      response = { statusCode: 200, response: "Item purchased" };
    } else if (account.balance >= event.bid+totalBidCost && event.bid >= item.price) {
      await makeBid(event.bid, username, event.id);
      response = { statusCode: 200, response: "Item bid on" };
    } else {
      response = { statusCode: 400, error: "Insufficient funds" };
    }

  } catch (error) {
    console.error("Error:", error.message);
    response = { statusCode: 500, error: error.message };
  } finally {
    pool.end();
  }
  return response;
};