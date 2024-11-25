import { createPool, verifyToken } from "../opt/nodejs/index.mjs";

export const handler = async (event)  => {
  let pool;

  try {
      pool = await createPool();
  } catch (error) {
      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
      return { statusCode: 500, error: "Could not make database connection" };
  }
  let getAdminItems = (filter) => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `SELECT * FROM Item`
      if(filter === "All") {
        sqlQuery+= ` WHERE status != 'Inactive'`;
      } else {
        sqlQuery+= ` WHERE status = '${filter}'`;
      }
      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    const { username, accountType } = await verifyToken(event.token);
    const isValid = username && accountType === "Admin";
    if (!isValid) {
        return { statusCode: 500, error: "Invalid token" };
    }

    let results  = await getAdminItems(event.filter);
    console.log(results);
    
    response = {
      statusCode: 200,
      items: results
    };
  }
  catch (err) {
    response = {
      statusCode: 400,
      error: err.message || err
    };
  }
  finally {
    pool.end();
  }
  return response;
};