import Home from '@/app/page';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect } from "vitest";


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


export function navigateToLogin() {
  const links = screen.getAllByRole('link');
  const loginLinks = links.filter((link: HTMLElement) => link.hasAttribute('href') && link.getAttribute('href')?.match(/login/));
  expect(loginLinks).toBeDefined();
  expect(loginLinks.length).toBeGreaterThanOrEqual(1);

  fireEvent.click(loginLinks[0]);
  // Should be at /login
  expect(window.location.hash.replaceAll('#', '')).toBe('/login');
}

/**
 * Simulates a login.
 * @param username The username to log in as.
 * @param password The password to log in with.
 * @example
 * ```TS
 * test("Logout exists", async () => {
 *    const username = "DummySeller";
 *    const password = "DummySeller";
 *    await login(username, password);
 * 
 *    // Check that user was redirected to /account
 *    expect(window.location.hash.replaceAll('#', '')).toBe('/account');
 * });
 * ```
 */
export async function login(username: string, password: string) {
  render(<Home />)
  navigateToLogin();

  const usernameInput: HTMLInputElement = screen.getByLabelText(/Username/);
  const passwordInput: HTMLInputElement = screen.getByLabelText(/Password/);

  // Ensure input elements are defined
  expect(usernameInput).toBeDefined();
  expect(passwordInput).toBeDefined();

  // Add information to the different inputs
  fireEvent.input(usernameInput, { target: { value: username } });
  fireEvent.input(passwordInput, { target: { value: password } });

  // Verify that the information was added to the form
  expect(usernameInput.value).toBe(username);
  expect(passwordInput.value).toBe(password);

  // Get login button
  // \s? means optional space
  const loginButton = screen.getByRole('button', { name: /log\s?in/i })
  expect(loginButton).toBeDefined();
  fireEvent.click(loginButton);

  // Check that it is logging in
  const message = screen.getByText(/Logging in/);
  expect(message).toBeDefined();

  // // Wait for response to be sent
  // await waitFor(() => screen.getByText(/logged in as/i), { timeout: 5000 })
  //   .then((currentMessage) => expect(currentMessage).toBeDefined());

  // Wait for redirect
  await waitFor(() => {
    expect(window.location.hash.replaceAll('#', '')).toBe('/account')
  }, { timeout: 5000 });
}

/**
 * Simulates a logout
 */
export async function logout() {
  // \s? means optional whitespace
  const logoutButtons = screen.getAllByRole('button', { name: /log\s?out/i });
  expect(logoutButtons.length).toBeGreaterThanOrEqual(1);

  expect(logoutButtons[0]).toBeDefined();

  fireEvent.click(logoutButtons[0]);

  // Make sure it was redirected properly
  // \/? is either / or ''
  await waitFor(() => expect(window.location.hash.replaceAll('#', '')).match(/\/?/));
}