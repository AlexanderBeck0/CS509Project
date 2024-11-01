import { verifyToken } from "../opt/nodejs/index.mjs";

/**
 * @param {{token: string}} event The login event
 */
export const handler = async (event) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { token } = event;

            // Ensure that an undefined or a null token resolve to not a valid token
            if (token === undefined || token === null) {
                return resolve({
                    statusCode: 200,
                    body: {
                        valid: false
                    }
                });
            }

            // Verify types
            if (typeof token !== 'string') {
                const error = new TypeError('Invalid token parameter. Expected a string.');
                console.error(error);
                return resolve({
                    statusCode: 500,
                    error: error.message,
                    valid: false
                });
            }

            // Async verifyToken
            // Note that nothing is being caught here to allow it to be caught in the below catch statement
            verifyToken(token).then(isValid => {
                return resolve({
                    statusCode: 200,
                    body: {
                        valid: isValid
                    }
                });
            });
        } catch (error) {
            console.error("Error while validating token: " + error);
            return reject({
                statusCode: 500,
                error: error.message,
                valid: false
            });
        }
    });
};