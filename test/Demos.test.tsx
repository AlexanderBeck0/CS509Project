import { afterAll, beforeAll, describe, test } from 'vitest';
import { generateRandomString } from './utils';

describe("iPhone bid demo", () => {
    // TODO: Remove this ignore line once this is implemented
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const sellerName = generateRandomString(10);
    const sellerPassword = generateRandomString(10);
    const buyerOneName = generateRandomString(10);
    const buyerOnePassword = generateRandomString(10);
    const buyerTwoName = generateRandomString(10);
    const buyerTwoPassword = generateRandomString(10);
    const itemName = generateRandomString(10);
    const itemDescription = generateRandomString(50);

    beforeAll(() => {
        // Ensure none of the sellers or buyers exist with their respective names
        // EXTREMELY unlikey for there to be a duplicate but do this for completeness
    });
    
    afterAll(() => {
        // Cleanup for after the demo is finished
        // IMPORTANT: These operations are using the DB, not using the page. The code within this function is
        // NOT intended for use on the frontend or backend, ONLY for tests.
        
        // In other words, DO NOT directly delete ANY data from the DB except for in this test.

        // Remove item from the db
        // Remove seller from db
        // Remove buyer's from db
    });

    test.todo("Create Seller"); // Should end up on seller page
    test.todo("Seller creates & publishes iPhone");
    test.todo("Create Buyer1"); // Add funds too
    test.todo("Buyer1 bids on iPhone");
    test.todo("Create Buyer2");
    test.todo("Buyer2 bids on iPhone"); // Add funds too
    test.todo("Buyer1 bids on iPhone");
    test.todo("Buyer1 wins bid");
    test.todo("Seller fulfills bid");
    describe("Aftermath of bid", () => {
        test.todo("iPhone is archived"); // With a status of fulfilled
        test.todo("Seller has n more funds");
        test.todo("Buyer has n less funds");
        test.todo("Buyer2 is able to search for iPhone in recently sold");
        test.todo("Customer is unable to see iPhone");
    });
});