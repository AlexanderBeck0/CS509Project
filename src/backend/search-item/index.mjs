import { createPool, getAccountByUsername } from "../opt/nodejs/index.mjs";

export const handler = async (event)  => {
  let pool;

  try {
      pool = await createPool();
  } catch (error) {
      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
      return { statusCode: 500, error: "Could not make database connection" };
  }
  let SearchDB = (query, sortBy) => {
    console.log("Searching...");
    let [sort, order] = sortBy.split('_');
    
    sort = sort != "" ? sort : "startDate";

    order = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
    console.log("Searching: "+query);
    console.log("Sort by: "+sort);
    console.log("Order: "+order);

    query = `%${query}%`;
    return new Promise((resolve, reject) => {
      const sqlQuery = `
          SELECT * FROM Item 
          WHERE status = 'Active' 
          AND (name LIKE ? OR description LIKE ? OR endDate LIKE ? OR price LIKE ? OR startDate LIKE ?) 
          ORDER BY ${sort} ${order}, startDate, endDate, price, name
      `;
      console.log("Query: "+sqlQuery);
      pool.query(sqlQuery, [query, query, query, query, query], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    let results = await SearchDB(event.query, event.sortBy);
    console.log(results);
    const filteredResults = results.map(({ id, image, name, description, price, startDate, endDate }) => ({
        id, image, name, description, price, startDate, endDate
      }));
    response = {
      statusCode: 200,
      items: filteredResults
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