import { createPool, getAccountByUsername } from "../opt/nodejs/index.mjs";

export const handler = async (event)  => {
  let pool;

  try {
      pool = await createPool();
  } catch (error) {
      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
      return { statusCode: 500, error: "Could not make database connection" };
  }

  let GetSellerItemsDB = (status, username) => {
    return new Promise((resolve, reject) => {
      let sqlQuery = undefined;
      if(status === "All") {
        sqlQuery = `
          SELECT * FROM Item 
          WHERE seller_username = '${username}'
          ORDER BY endDate
        `;
      } else if (status === "Archived"){
        sqlQuery = `
        SELECT * FROM Item 
        WHERE archived = 1 && seller_username = '${username}'
        ORDER BY endDate
      `;
      } else {
        sqlQuery = `
          SELECT * FROM Item 
          WHERE status = '${status}' && seller_username = '${username}'
          ORDER BY endDate
        `;
      }
      console.log(sqlQuery);
      pool.query(sqlQuery, [status, username], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    let results = await GetSellerItemsDB(event.status, event.username);
    response = {
      statusCode: 200,
      items: results
    };
  }
  catch (err) {
    response = {
      statusCode: 400,
      error: err
    };
  }
  finally {
    pool.end();
  }
  return response;
};