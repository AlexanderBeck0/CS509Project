import { describe, test } from 'vitest';

// TODO: Make a list of endpoints to share between files?

// This is separate from RegisterPage.test.tsx because this is all doable in the backend, and does not rely
// on the frontend. This is unlike LoginPage.test.tsx, which relies on cookies to determine if they successfully logged in.

describe("Create Account", () => {
    describe("Base cases", () => {
        test.todo("Seller");
        test.todo("Buyer");
        test.todo("Admin"); // Should disallow
    });

    describe("Edge cases", () => {
        test.todo("Duplicate username"); // Should disallow
    });
});

describe("Close Account", () => {
    describe("Base cases", () => {
        test.todo("Seller");
        test.todo("Buyer");
        test.todo("Admin"); // Should disallow
    });

    describe("Edge cases", () => {
        test.todo("Already closed"); // Should disallow
        test.todo("Active items"); // Should disallow
        test.todo("Active bids"); // Should disallow
    });
});