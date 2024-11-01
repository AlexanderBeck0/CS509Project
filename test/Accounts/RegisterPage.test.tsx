import Home from "@/app/page";
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { generateRandomString, mockLocalStorage } from "../utils";

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
});

describe.sequential("Register example", () => {
    // Flow should be:
    // 1. Click profile to login
    // 2. Click Create Account link
    // 3. Fill out username, password, and account type
    // 4. Create Account
    // Finally, ensure that there is a token saved in local storage

    // Note: This does NOT check if the account is in the DB. Only if the token was returned.

    const randomUsername = generateRandomString(10);
    const randomPassword = generateRandomString(10);

    // Setup
    beforeAll(() => {
        render(<Home />);
        // Ensure there is no token
        if (localStorage.getItem("token") !== undefined) localStorage.removeItem("token");
    });
    afterAll(cleanup);

    test("Navigate to /createAccount", async () => {
        // 1. Click profile to login
        // Get the login button by its role as a button and by the class AccountButton
        // There is a MUCH better example down in Login link exists
        const loginButtons = screen.getAllByRole('button').filter((elm: HTMLElement) => elm.className.includes("AccountButton"));
        expect(loginButtons.length).toBe(1);

        // loginButton[0] is the only login button at this point
        fireEvent.click(loginButtons[0]);

        // Should be at /login
        expect(window.location.hash.replaceAll('#', '')).toBe('/login');

        // 2. Click Create Account link
        const createAccountQuery = screen.getAllByText(/Create Account/);
        expect(createAccountQuery).toBeDefined();
        expect(createAccountQuery.length).toBeGreaterThanOrEqual(1);

        const createAccountLink = createAccountQuery.filter((elm: HTMLElement) => elm.hasAttribute('href'));
        expect(createAccountLink).toBeDefined();
        expect(createAccountLink.length).toBe(1);

        fireEvent.click(createAccountLink[0]);

        // Should be at createAccount
        expect(window.location.hash.replaceAll('#', '')).toBe('/createAccount');
    });

    test("Fill out form", async () => {
        // Ensure that the window location is /createAccount.
        expect(window.location.hash.replaceAll('#', '')).toBe('/createAccount');

        // 3. Fill out username, password, and account type
        // Get all the different input elements
        const usernameInput: HTMLInputElement = screen.getByLabelText(/Username/);
        const passwordInput: HTMLInputElement = screen.getByLabelText(/Password/);
        const accountTypeInput: HTMLSelectElement = screen.getByLabelText(/Account Type/);

        // Ensure input elements are defined
        expect(usernameInput).toBeDefined();
        expect(passwordInput).toBeDefined();
        expect(accountTypeInput).toBeDefined();

        // Add information to the different inputs
        fireEvent.input(usernameInput, { target: { value: randomUsername } });
        fireEvent.input(passwordInput, { target: { value: randomPassword } });
        fireEvent.input(accountTypeInput, { target: { value: "Seller" } }); // "Buyer" or "Seller"

        // Verify that the information was added to the form
        expect(usernameInput.value).toBe(randomUsername);
        expect(passwordInput.value).toBe(randomPassword);
        expect(accountTypeInput.value).toBe("Seller");

        // Get submit button
        const submitButton = screen.getByRole('button', { name: /create account/i })
        expect(submitButton).toBeDefined();

        // 4. Create Account
        console.log(`Creating a Seller with username: '${randomUsername}' and password '${randomPassword}'`);
        fireEvent.click(submitButton);

        // Check that it is Registering
        let message = screen.getByText(/Registering/);
        expect(message).toBeDefined();

        // Wait for response to be sent
        // Use a value of 3600 for 3.6 seconds, and 4100 as a slightly longer timeout
        await waitFor(() => new Promise((resolve) => setTimeout(resolve, 3600)), { timeout: 4100 })
            .then(() => {
                // BUG: This is causing statusCode of 400 as of PR 14 (before this code was pushed to main for the first time)
                message = screen.getByText(/Registered/);
                expect(message).toBeDefined();
            });
    });

    test.todo("Token exists");
});

describe("Components Exist", () => {
    beforeEach(() => {
        render(<Home />);
        window.location.hash = "#/createAccount";
    });

    afterEach(cleanup);

    test("Login link exists", () => {
        // Ensure that the location is on the homepage
        expect(window.location.hash.replaceAll('#', '')).toBe('/createAccount');

        const links = screen.getAllByRole('link');
        const loginLinks = links.filter((link: HTMLElement) => link.hasAttribute('href') &&
            link.getAttribute('href')?.match(/login/));
        expect(loginLinks).toBeDefined();
        expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    });

    test.todo("Search bar does not exist"); // Search bar should not exist in RegisterPage
});