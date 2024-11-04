import Home from '@/app/page';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { login, logout, navigateToLogin } from '../utils';

describe.sequential("Login", () => {
    // This Login code is held together by bandaids. Just a heads up.

    describe.sequential("Base cases", () => {
        afterAll(cleanup);
        const accounts = [
            { type: "Seller", username: "DummySeller", password: "DummySeller" },
            { type: "Buyer", username: "DummyBuyer", password: "DummyBuyer" },
            { type: "Admin", username: "admin1", password: "admin123" }
        ];

        // Writing this one single test case actually performs it over all the cases in accounts.
        test.each(accounts)("$type", ({ username, password }) => {
            login(username, password);

            expect(localStorage.getItem("token")).toBeDefined();
            // Do NOT call logout here. It causes issues.
            cleanup();
        });
    });

    describe.sequential("Edge cases", () => {
        const attempts = [
            { name: "Account does not exist", username: "ThisAccountDoesntExist", password: "12345", error: /does(?:n'?t|\snot) exist/i },
            { name: "Incorrect password", username: "admin1", password: "12345", error: /incorrect password/i },
            { name: "Closed Account", username: "closedSeller", password: "Salty", error: /closed/i },
        ]
        beforeAll(() => {
            render(<Home />);
            navigateToLogin();
        });

        afterAll(cleanup);
        test.each(attempts)("$name", async ({ username, password, error }) => {
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
            const loginButton = screen.getByRole('button', { name: /login/i })
            expect(loginButton).toBeDefined();
            fireEvent.click(loginButton);

            // Check that it is logging in
            const message = screen.getByText(/Logging in/);
            expect(message).toBeDefined();

            // Wait for response to be sent
            // Regex checks for 'does not exist' or 'doesn't exist' or 'doesnt exist'
            await waitFor(() => screen.getByText(error), { timeout: 5000 })
                .then((currentMessage) => expect(currentMessage).toBeDefined());
        });
    });
});

describe.sequential("Logout", () => {
    afterEach(cleanup);
    const accounts = [
        { type: "Seller", username: "DummySeller", password: "DummySeller" },
        { type: "Buyer", username: "DummyBuyer", password: "DummyBuyer" },
        { type: "Admin", username: "admin1", password: "admin123" }
    ];

    // Writing this one single test case actually performs it over all the cases in accounts.
    test.each(accounts)("$type", { timeout: 5000 }, async ({ username, password }) => {
        // Some cutting edge logic right here I know
        // I decided to use these helper functions instead of hard-coding it to make the logic reusable
        await login(username, password);
        await logout();

        expect(localStorage.getItem("token")).toBeNull();
    });
});

describe("Components Exist", () => {
    test.todo("Create account link exists"); // There should be a link to Create Account somewhere
    test.todo("Search bar does not exist"); // Search bar should not exist in login page
});