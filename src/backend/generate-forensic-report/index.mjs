import { createPool, verifyToken, getAccountByUsername } from "../opt/nodejs/index.mjs";

export const handler = async (event)  => {
  let pool;

  try {
      pool = await createPool();
  } catch (error) {
      console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
      return { statusCode: 500, error: "Could not make database connection" };
  }
  let CompletedItems = () => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `SELECT * FROM Item WHERE status='Completed' AND endDate <= DATE_SUB(NOW(), INTERVAL 3 DAY)`
      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let LongTimer = () => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `SELECT * FROM Item WHERE DATEDIFF(endDate, startDate) > 10 AND status='Active'`
      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let HighPrices = () => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `SELECT * FROM Item WHERE price > 10000 AND status='Active'`
      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let ManyBids = () => {
    return new Promise((resolve, reject) => {
      let sqlQuery = `SELECT i.* FROM Item i 
      JOIN Bid b ON i.id = b.item_id
      WHERE i.status = 'Active'
      GROUP BY i.id
      HAVING COUNT(b.id) >= 5`
      pool.query(sqlQuery, [], (error, rows) => {
        if (error) { console.log("DB error"); return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response = undefined;

  try {
    const { username, accountType } = await verifyToken(event.token);
    console.log(username);
    console.log(accountType);
    const isValid = username && accountType === "Admin";
    if (!isValid) {
        return { statusCode: 500, error: "Invalid token" };
    }

    const completedItems = await CompletedItems();
    const longTimerItems = await LongTimer();
    const highPriceItems = await HighPrices();
    const manyBids = await ManyBids();

    const itemsMap = {};
    const sellerWarnings = {};

    const addWarning = (item, warning) => {
      if (!itemsMap[item.id]) {
        itemsMap[item.id] = { id: item.id, name: item.name, image: item.image, warnings: [] }; 
      }
      itemsMap[item.id].warnings.push(warning);

      if (!sellerWarnings[item.seller_username]) {
        sellerWarnings[item.seller_username] = 0; 
      }
      sellerWarnings[item.seller_username] += 1;
    };

    completedItems.forEach(item => addWarning(item, "Item has been completed for more than 3 days"));
    
    longTimerItems.forEach(item => addWarning(item, "Bid timer is really long"));
    
    highPriceItems.forEach(item => addWarning(item, "Price is higher than 10,000"));
    
    manyBids.forEach(item => addWarning(item, "Many bids on this item"));

    const items = Object.values(itemsMap);
    
    let accounts = [];
    for (const username in sellerWarnings) {
      const totalWarnings = sellerWarnings[username];
      if (totalWarnings > 2) {
        const accountData = await getAccountByUsername(username, pool);

        if (!accountData.warnings) {
          accountData.warnings = [];
        }
        accountData.warnings.push("Has more than 2 warnings");

        accounts = [...accounts, {username: accountData.username, warnings: accountData.warnings}];
      }
    }

    response = {
      statusCode: 200,
      items: items,
      accounts: accounts
    };
    console.log(response);
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