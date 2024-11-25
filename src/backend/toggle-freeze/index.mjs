import { createPool, verifyToken } from "../opt/nodejs/index.mjs";

export const handler = async (event) => {
  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }
  let toggleFreeze = (currStatus, id) => {
    return new Promise((resolve, reject) => {
      const sqlQuery = `UPDATE Item SET status = ? WHERE id = ?`
      const newStatus = currStatus === "Active" ? "Frozen" : "Active"; // Note: does not check end date.
      pool.query(sqlQuery, [newStatus, id], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    const { accountType } = await verifyToken(event.token).catch(error => {
      if (error?.name === "TokenExpiredError") {
        return {
          statusCode: 400,
          error: "Your token has expired. Please log in again."
        };
      }
    })

    if (accountType !== "Admin") {
      return {
        statusCode: 403,
        error: "Permission denied. Only Admins are allowed to freeze/unfreeze items."
      }
    };

    await toggleFreeze(event.status, event.id).catch(error => {
      return {
        statusCode: 400,
        error: typeof error === "string" ? error : error instanceof Error ? error.message : JSON.stringify(error)
      }
    })

    response = {
      statusCode: 200,
    };
  }
  catch (err) {
    response = {
      statusCode: 400,
      error: err.message || err
    };
  }
  finally {
    pool.end((err) => {
      if (err) {
        console.error("Failed to close MySQL Pool. Blantantly ignoring... Error: " + JSON.stringify(err));
      }
    });
  }
  return response;
};