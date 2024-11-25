import { createPool, getAccountByUsername, verifyToken, getItemFromID } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{id: string, token?: string}} event The get item event.
 */
export const handler = async (event) => {
  let pool;

  try {
    pool = await createPool();
  } catch (error) {
    console.error("Failed to create MySQL Pool. Error: " + JSON.stringify(error));
    return { statusCode: 500, error: "Could not make database connection" };
  }

  return new Promise(async (resolve, reject) => {
    try {
      let username = undefined;
      if (event.token) {
        let token = await verifyToken(event.token);
        username = token.username;
      }

      await getItemFromID(Number.parseInt(event.id), pool, username).then((item) => {
        pool.end();
        return resolve({
          statusCode: 200,
          item: item
        });
      }).catch((error) => {
        // if (error instanceof Error) throw error;
        pool.end();
        return resolve({
          statusCode: 403,
          error: error instanceof Error ? error.message : JSON.stringify(error)
        });
      });
    } catch (error) {
      console.error("Failed to get item. Error: " + error instanceof Error ? error.message : JSON.stringify(error));
      pool.end();
      return resolve({
        statusCode: 500, 
        error: error instanceof Error ? error.message : JSON.stringify(error)
      });
    }
  });
};