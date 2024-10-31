/**
 * Generates a random string of letters and numbers.
 * @param length The length of the random string to be generated.
 * @returns A random string of letters and numbers.
 */
export function generateRandomString(length: number): string {
    if (length < 1) return "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    const charactersLength = characters.length;
    let randomString: string = "";
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return randomString;
}