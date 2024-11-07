import { createPool, getUsernameFromToken } from "../opt/nodejs/index.mjs";

export const handler = async (event)  => {
  let pool;

  try {
      pool = await createPool();
  } catch (error) {
      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
      return { statusCode: 500, error: "Could not make database connection" };
  }
  let addItem = (username, item) => {
    return new Promise((resolve, reject) => {
      const sqlQuery = `
          INSERT INTO Item
          VALUES (null, '${item.name}', '${item.description}', '${item.image}', ${item.initialPrice}, ${item.initialPrice}, '${item.startDate}', ${item.endDate === null ? null : `${item.endDate}`}, 0, 'Inactive', '${username}')
      `;

      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let updateItem = (username, item) => {
    return new Promise((resolve, reject) => {

      const sqlQuery = `
          UPDATE Item
          SET name = '${item.name}', description = '${item.description}', image = '${item.image}', initialPrice = ${item.initialPrice}, startDate = '${item.startDate}', endDate = '${item.endDate}', archived = ${item.archived}, status = '${item.status}'
          WHERE id = '${item.id}';
          `;

      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    const username = await getUsernameFromToken(event.token);
    let results = undefined;
    if("id" in event.item) {
      console.log("has id");
      results = await updateItem(username, event.item);
    } else {
      results = await addItem(username, event.item);
    }
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