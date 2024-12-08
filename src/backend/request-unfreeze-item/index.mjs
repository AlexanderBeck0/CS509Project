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
  
  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  let requestUnfreeze = (id) => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `UPDATE Item SET status='Requested' WHERE id=?`;
      pool.query(sqlQuery, [id], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  }
  
  let response = undefined;
  try {
    const { accountType } = await getAccountByUsername(username, pool);

    if(accountType !== "Seller") {
      response = {statusCode: 400, error: "Must be a seller to request and unfreeze"}
    } else {
      await requestUnfreeze(event.id);
      response = {statusCode: 200}
    }

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