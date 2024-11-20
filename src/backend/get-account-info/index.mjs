import { createPool, getAccountByUsername, verifyToken } from "../opt/nodejs/index.mjs";

/**
 * 
 * @param {{token: string}} event The account to get the information from
 * @returns 
 */
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
    const { username } = await verifyToken(event.token).catch(error => {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        return {
          statusCode: 400,
          error: "Your token has expired. Please log in again."
        };
      }
    });

    const account = await getAccountByUsername(username, pool);
    response = {
      statusCode: 200,
      account: account
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
    pool.end();
  }
  return response;
};