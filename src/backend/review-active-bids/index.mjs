import { createPool, getAccountByUsername, verifyToken } from "../opt/nodejs/index.mjs";

export const handler = async (event) => {
  let response;
  // Verify the token and extract user info
  const { username, accountType } = await verifyToken(event?.token).catch(error => {
    if (error.name === 'TokenExpiredError') return {
      statusCode: 400,
      error: "Your token has expired. Please log in again."
    }
  });

  if (accountType !== "Buyer") {
    return { statusCode: 400, error: "Insufficient permission to view bids" };
  }

  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  try {

    // Check if user exists
    const account = await getAccountByUsername(username, pool);

    // Query to get active bids for the user
    const fetchActiveBids = () => {
      let sqlQuery = `
      SELECT 
        b.id AS bidId,
        b.bid,
        b.timeOfBid,
        i.id AS itemId,
        i.image,
        i.name,
        i.description,
        i.price,
        i.startDate,
        i.endDate,
        i.status
      FROM MostRecentBids b
      JOIN Item i ON b.item_id = i.id
      WHERE b.buyer_username = ? AND i.status != "Completed"
      `;
      const params = [username];
      if (event.status === "Active" || event.status === "Fulfilled") {
        sqlQuery += ` AND i.status = ?`;
        params.push(event.status);
      }
      return new Promise((resolve, reject) => {
        pool.query(sqlQuery, params, (error, rows) => {
          if (error) return reject(error);
          resolve(rows);
        });
      });
    };
    const results = await fetchActiveBids();
    // Format the response
    const bids = results.map((row) => ({
      id: row.bidId,
      bid: row.bid,
      timeOfBid: row.timeOfBid,
      item: {
        id: row.itemId,
        image: row.image,
        name: row.name,
        description: row.description,
        price: row.price,
        startDate: row.startDate,
        endDate: row.endDate,
        status: row.status,
      },
    }));

    response = {
      statusCode: 200,
      body: {
        username: username,
        bids: bids,
      },
    };
  } catch (error) {
    console.error("Error:", error);
    response = {
      statusCode: 500,
      error: "An error occurred while processing your request.",
    };
  } finally {
    pool.end((err) => {
      if (err) {
        console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
      }
    });
  }

  return response;
};
