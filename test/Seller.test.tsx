import { cleanup, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { login, mockLocalStorage } from './utils';


Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
});

describe("Seller UI requirements", () => {
    beforeAll(async () => {
        // Login as DummySeller
        const username = "DummySeller";
        const password = "DummySeller";
        await login(username, password);
    });

    afterAll(cleanup);

    test("No search bar visible for Sellers", async () => {
        // Expect the url to be under account
        expect(window.location.hash.replaceAll('#', '')).toBe('/account');

        // Add the logic for checking if the seller is a seller here

        expect(screen.queryAllByRole('searchbox').length).toBe(0);
    });

    test("Logout exists", async () => {
        // Expect the url to be under account
        expect(window.location.hash.replaceAll('#', '')).toBe('/account');

        // There should be a token
        expect(localStorage.getItem("token")).toBeDefined();

        expect(screen.getAllByText(/log out/i)).toBeDefined();
    });

    test("Close Account exists", async () => {
        // Expect the url to be under account
        expect(window.location.hash.replaceAll('#', '')).toBe('/account');

        // There should be a token
        expect(localStorage.getItem("token")).toBeDefined();

        expect(screen.getAllByText(/close account/i)).toBeDefined();
    });
})