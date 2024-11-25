import { createPool, verifyToken, getAccountByUsername } from "../opt/nodejs/index.mjs";

export const handler = async (event) => {
  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  let response;

  try {
    // Verify the token and extract user info
    let userData = undefined;
    let username = undefined;
    let accountType = undefined;
    if (event.token) {
      userData = await verifyToken(event.token);
      username = userData.username;
      accountType = userData.accountType;
    }
 
    if (accountType !== "Buyer") {
      return { statusCode: 400, error: "Insufficient permission to view bids" };
    }

    // Check if user exists
    const account = await getAccountByUsername(username,pool);

    // Query to get active bids for the user
    const fetchActiveBids = () => {
      const sqlQuery = `
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
      FROM Bid b
      JOIN Item i ON b.item_id = i.id
      WHERE b.buyer_username = ?;
      `;
      return new Promise((resolve, reject) => {
        pool.query(sqlQuery, [username], (error, rows) => {
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
    pool.end();
  }

  return response;
};
