import { createPool, getAccountByUsername, getUsernameFromToken } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{token: string}} event The account to get the information from
 * @returns 
 */
export const handler = async (event)  => {
    let pool;

    try {
        pool = await createPool();
    } catch (error) {
        console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
        return { statusCode: 500, error: "Could not make database connection" };
    }

    let getAccountInfo = (username) => {
        return getAccountByUsername(username,pool,true);
    }
    
    let response = undefined;

    try {
      const username = await getUsernameFromToken(event.token);
      let results = await getAccountInfo(username);
      response = {
        statusCode: 200,
        account: results
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