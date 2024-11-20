import { createPool, getAccountByUsername } from "../opt/nodejs/index.mjs";

export const handler = async (event)  => {
  let pool;

  try {
      pool = await createPool();
  } catch (error) {
      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
      return { statusCode: 500, error: "Could not make database connection" };
  }
  let SearchDB = (query, sortBy, recentlySold) => {
    console.log("Searching...");
    let [sort, order] = sortBy.split('_');
    
    sort = sort != "" ? sort : "startDate";

    order = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
    console.log("Searching: "+query);
    console.log("Sort by: "+sort);
    console.log("Order: "+order);

    const isEmptyQuery = !query || query.trim() === "";
    let isNumeric = isEmptyQuery ? false : !isNaN(query);
    let isDate = /^\d{2}\/\d{2}\/\d{4}$/.test(query); 
    let formattedDate = null;

    if (isDate) {
      try {
        const [month, day, year] = query.split('/');
        if (!isNaN(new Date(`${year}-${month}-${day}`).getTime())) {
          formattedDate = `${year}-${month}-${day}`;
        }
      } catch (err) {
        console.error("Invalid date format: " + query);
      }
    }

    console.log(formattedDate);

    query = `%${query}%`;
    return new Promise((resolve, reject) => {
      let sqlQuery = `
      SELECT * FROM Item
      `;
      if(recentlySold) {
        sqlQuery += `WHERE (status = 'Completed' OR status = 'Fulfilled')
        AND (DATE(endDate) = CURDATE() - INTERVAL 1 DAY OR DATE(endDate) = CURDATE() - INTERVAL 2 DAY)
        `;
      } else {
        sqlQuery += `WHERE status = 'Active'
        `;
      }
      
      const params = [];

      if (!isEmptyQuery) {
        sqlQuery += `
          AND (
            name LIKE ? OR 
            description LIKE ?
        `;
        params.push(query, query);
  
        if (isNumeric) {
          sqlQuery += ` OR price LIKE ?
          `;
          params.push(query);
        }
  
        if (formattedDate) {
          sqlQuery += ` OR DATE(startDate) = ? OR DATE(endDate) = ?
          `;
          params.push(formattedDate, formattedDate);
        }
  
        sqlQuery += `)
        `;
      }
      sqlQuery += `ORDER BY ${sort} ${order}, startDate, endDate, price, name`;

      console.log("Query: "+sqlQuery);
      pool.query(sqlQuery, params, (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    let results  = await SearchDB(event.query, event.sortBy, event.recentlySold);
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