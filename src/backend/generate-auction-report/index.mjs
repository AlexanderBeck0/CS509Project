import { createPool } from "../opt/nodejs/index.mjs";

export const handler = async (event) => {
  let pool;

  // Create a MySQL pool
  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  const generateAuctionReport = () => {
    return new Promise((resolve, reject) => {
      const sqlQuery = `
        SELECT SUM(price) AS totalPrice 
        FROM Item 
        WHERE status = 'fulfilled'
      `;

      pool.query(sqlQuery, (error, results) => {
        if (error) {
            console.log("DB error", error);
            return reject(error);
        }
        return resolve(results[0].totalPrice);
    });    
    });
  };

  let response;

  try {
    const totalPrice = await generateAuctionReport();
    response = {
      statusCode: 200,
      totalPrice: totalPrice,
    };
  } catch (err) {
    response = {
      statusCode: 400,
      error: err,
    };
  } finally {
    pool.end();
  }

  return response;
};
