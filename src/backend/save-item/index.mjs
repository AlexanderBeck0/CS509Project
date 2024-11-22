import { createPool, verifyToken } from "../opt/nodejs/index.mjs";

let addItem = (username, accountType, item, pool) => {
  return new Promise((resolve, reject) => {

    // Check that they are a Seller
    if (accountType !== "Seller") return reject("Only Sellers can add items!");

    const sqlQuery = `
        INSERT INTO Item
        VALUES (null, ?, ?, ?, ?, ?, ?, ?, 0, 'Inactive', ?, 0)
    `;

    pool.query(sqlQuery, [item.name, item.description, item.image, item.initialPrice, item.initialPrice, item.startDate, item.endDate, username], (error, rows) => {
      if (error) { console.log("DB error"); return reject(error); }
      return resolve(rows);
    });
  });
};

let updateItem = (username, accountType, item, pool) => {
  return new Promise(async (resolve, reject) => {

    // Check that they are a Seller
    if (accountType !== "Seller") return reject("Only Sellers can edit items!");

    // Backend checks for the item
    await pool.query("SELECT * FROM Item WHERE id = ?", [item.id], (error, results) => {
      if (error) return reject(error);
      if (!results || results.length === 0) return reject("Item was not found!");
      results = results[0];

      if (results.seller_username !== username) return reject("Not the owner of this item!");
      if (results.status !== "Inactive") return reject("Sellers can only edit inactive items.");
      if (results.status !== item.status) return reject("You are not permitted change the item's status!");
      if (item.id !== results.id) return reject("You are not permitted to change the item's id!");
      if (results.seller_username !== item.seller_username) return reject("You are not permitted transfer ownership of the item!");
      if (results.archived) return reject("Unable to edit archived items!");
      if (item.startDate < new Date()) console.warn("Start date is before the current date. Allowing...");
      if (item.endDate) {
        // Since endDate is optional, only run these checks if it exists
        if (item.endDate < new Date()) return reject("Cannot set end date in the past!");
        if (item.endDate < item.startDate) return reject("Cannot set end date before start date!");
        if (item.startDate > item.endDate) return reject("Cannot set start date after end date!"); // Not sure if this will run...
      }
    });

    // If it gets to this point, the Seller is the owner of the item.

    const sqlQuery = `
        UPDATE Item
        SET name = ?, description = ?, image = ?, initialPrice = ?, price = ?, startDate = ?, endDate = ?, archived = ?, forSale = ?
        WHERE id = ?;
        `;

    // Note that we can set the price here to initialPrice because them being able to edit implies that it is not published
    // As such, there can be no bids
    pool.query(sqlQuery, [item.name, item.description, item.image, +item.initialPrice, +item.initialPrice, item.startDate, item.endDate, item.archived, item.forSale, item.id], (error, rows) => {
      if (error) { console.log("DB error"); return reject(error); }
      return resolve(rows);
    });
  });
};

export const handler = async (event) => {
  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  let response = undefined;

  try {
    const { username, accountType } = await verifyToken(event.token);

    let results = undefined;
    if (event.item?.id !== null && event.item?.id !== undefined) {
      console.log("has id");
      results = await updateItem(username, accountType, event.item, pool);
    } else {
      results = await addItem(username, accountType, event.item, pool);
    }

    response = {
      statusCode: 200,
      item: results
    };
  }
  catch (err) {
    console.error(err);
    response = {
      statusCode: 400,
      error: err instanceof Error ? err.message : err
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