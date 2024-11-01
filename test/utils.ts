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

/**
 * # mockLocalStorage
 * mockLocalStorage is used to allow the checking of localStorage in vitest.
 * 
 * @example
 * ```JS
 * Object.defineProperty(window, "localStorage", {
 *  value: mockLocalStorage,
 * });
 * ```
 * @example
 * ```JS
 * test('Ensure token is undefined', () => {
 *    expect(localStorage.getItem('token')).toBeUndefined();
 * });
 * ```
 * @example
 * ```JS
 * test('Get token from localStorage', () => {
 *    const token = localStorage.getItem('token');
 *    expect(token).toBeDefined();
 * });
 * ```
 * @example
 * ```JS
 * // Clear a token from localStorage
 * if (localStorage.getItem('token') !== undefined) localStorage.removeItem('token');
 * ```
 * @author Benjamin Rae on StackOverflow
 * @see {@link https://stackoverflow.com/questions/76655326/how-to-mock-localstorage-for-typescript-unit-tests}
 */
export const mockLocalStorage = (() => {
  let store = {} as Storage;

  return {
    getItem(key: string) {
      return store[key];
    },

    setItem(key: string, value: string) {
      store[key] = value;
    },

    removeItem(key: string) {
      delete store[key];
    },

    clear() {
      store = {} as Storage;
    },
  };
})();