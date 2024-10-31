import { describe, test } from 'vitest';

describe("Login", () => {
    describe("Base cases", () => {
        test.todo("Seller");
        test.todo("Buyer");
        test.todo("Admin");
    });

    describe("Edge cases", () => {
        test.todo("Cannot login while already logged in"); // Should disallow
        test.todo("Wrong password"); // Should disallow
        test.todo("Closed Account"); // Should disallow
    });
});

describe("Logout", () => {
    describe("Base cases", () => {
        test.todo("Seller");
        test.todo("Buyer");
        test.todo("Admin");
    });

    describe("Edge cases", () => {
        test.todo("Cannot logout while not logged in"); // Should disallow
    });
});

describe("Components Exist", () => {
    test.todo("Create account link exists"); // There should be a link to Create Account somewhere
    test.todo("Search bar does not exist"); // Search bar should not exist in login page
});