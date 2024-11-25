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

    let formattedDate = null;
    let priceRange = null;
    const pricePattern = /\b(\d+)-(\d+)\b/;
    const datePattern = /\b(\d{2}\/\d{2}\/\d{4})\b/;
    
    const priceMatch = query.match(pricePattern);
    if (priceMatch) {
      priceRange = {
        minPrice: parseFloat(priceMatch[1]),
        maxPrice: parseFloat(priceMatch[2])
      };
      query = query.replace(pricePattern, "").trim();
    }

    let dateMatch = query.match(datePattern);
    if (dateMatch) {
      const detectedDate = dateMatch[0];
      query = query.replace(datePattern, "").trim();
      try {
        const [month, day, year] = detectedDate.split('/');
        if (!isNaN(new Date(`${year}-${month}-${day}`).getTime())) {
          formattedDate = `${year}-${month}-${day}`;
        }
      } catch (err) {
        console.error("Invalid date format: " + detectedDate);
      }
    }
    console.log(priceRange);
    console.log(formattedDate);
    console.log(query);

    const isEmptyQuery = !query || query.trim() === "";

    query = `%${query}%`;
    return new Promise((resolve, reject) => {
      let sqlQuery = `
      SELECT * FROM Item
      `;
            
      const conditions = [];
      const params = [];

      if (recentlySold) {
        conditions.push(`(status = 'Completed' OR status = 'Fulfilled')`);
        conditions.push(`endDate >= NOW() - INTERVAL 1 DAY AND endDate <= NOW()`);
      } else {
        conditions.push(`status = 'Active'`);
      }

      if (!isEmptyQuery) {
        conditions.push(`(name LIKE ? OR description LIKE ?)`);
        params.push(query, query);
      }

      if (priceRange) {
        conditions.push(`price BETWEEN ? AND ?`);
        params.push(priceRange.minPrice, priceRange.maxPrice);
      }

      if (formattedDate) {
        conditions.push(`(DATE(CONVERT_TZ(startDate, 'UTC', 'America/New_York')) = ? OR DATE(CONVERT_TZ(endDate, 'UTC', 'America/New_York')) = ?)`);
        params.push(formattedDate, formattedDate);
      }

      if (conditions.length > 0) {
        sqlQuery += ` WHERE ` + conditions.join(' AND ');
      }
      sqlQuery += ` ORDER BY ${sort} ${order}, startDate, endDate, price, name`;
      console.log(sqlQuery);
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