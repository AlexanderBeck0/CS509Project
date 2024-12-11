import { createPool, getAccountByUsername, getItemFromID, verifyToken } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{id: string, token?: string}} event The get item event.
 */
export const handler = async (event) => {

  const { username } = await verifyToken(event.token).catch(error => {
    if (error?.name === "TokenExpiredError") {
      return {
        statusCode: 400,
        error: "Your token has expired. Please log in again."
      };
    }
  });

  if (isNaN(+event.bid)) {
    return {
      statusCode: 400,
      error: "Bid must be a number!"
    }
  }

  if (Number.parseInt(event.bid) !== Math.floor(Number.parseInt(event.bid))) {
    return {
      statusCode: 400,
      error: "Bid must be a whole number!"
    }
  }

  if (+event.bid < 1) {
    return {
      statusCode: 400,
      error: "Bid must be a number greater than 0!"
    }
  }

  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  let makeBid = (bid, username, id) => {
    return new Promise(async (resolve, reject) => {
      pool.query('SELECT buyer_username FROM MostRecentBids WHERE item_id = ?', [id], (error, rows) => {
        if (error) {
          console.error(JSON.stringify(error));
          return reject(error);
        }
        if (rows && rows.length > 0 && rows[0].buyer_username === username) {
          // Prevent Buyer from bidding on themselves
          console.log("Equal usernames")
          return reject("Permission denied. Cannot outbid yourself.");
        }

        // As much as I hate to nest 3 query statements into one, it is necessary.
        let sqlQuery = `
        INSERT INTO Bid
        VALUES (null, ?, NOW(), ?, ?)
      `;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pool.query(sqlQuery, [bid, username, id], (error, _rows) => {
          if (error) {
            console.error(JSON.stringify(error));
            return reject(error);
          }

          let updateQuery = `UPDATE Item SET price = ? WHERE id = ?`;
          pool.query(updateQuery, [bid, id], (error, rows) => {
            if (error) {
              console.error(error);
              return reject(error);
            }
            return resolve(rows);
          });
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
      const sqlQuery = `SELECT SUM(b.bid) AS totalBidCost
        FROM MostRecentBids b
        INNER JOIN Item i ON b.item_id = i.id
        WHERE b.buyer_username = ? AND (i.status = 'Active' OR i.status = 'Completed')`;
      pool.query(sqlQuery, [username], (error, result) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        const totalBidCost = result[0].totalBidCost || 0;
        return resolve(totalBidCost);
      });
    });
  }

  let response = undefined;
  try {
    const item = await getItemFromID(Number.parseInt(event.id), pool, username);
    const account = await getAccountByUsername(username, pool);
    const totalBidCost = await getTotalBidCost(username);

    if (item.forSale) {
      // Handle forSale items
      if (account.balance < item.price + totalBidCost) {
        return { statusCode: 400, error: "Insufficient balance to purchase this item!" }
      }

      // account.balance >= item.price + totalBidCost
      await makeBid(item.price, username, event.id).catch(error => {
        throw (typeof error === "string" ? new Error(error) : error)
      });
      await buyItem(event.id);
      pool.end((err) => {
        if (err) {
          console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
        }
      });
      return { statusCode: 200, response: "Item purchased" };
    }

    // Handle bids
    if (account.balance < item.price + totalBidCost) {
      return { statusCode: 400, error: "Insufficient balance to bid on this item!" }
    }

    // account.balance >= item.price + totalBidCost
    if (event.bid <= item.price || (item.initialPrice !== item.price && event.bid <= item.price)) {
      return { statusCode: 400, error: "Must increase the bid on the item!" }
    }

    // event.bid > item.price
    await makeBid(event.bid, username, event.id).catch(error => {
      throw (typeof error === "string" ? new Error(error) : error)
    });

    response = response || { statusCode: 200, response: "Item bid on" };


  } catch (error) {
    console.error("Error:", error.message);
    response = { statusCode: 500, error: error.message };
  } finally {
    pool.end((err) => {
      if (err) {
        console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
      }
    });
  }
  return response;
};