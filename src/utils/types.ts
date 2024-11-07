// #region Items
/**
 * # ItemStatus
 * A seller can review their items to see which ones are `inactive` (not yet published), 
 * `active` (waiting for more bids), `failed` (time has expired without any bids), 
 * `completed` (time has expired with bids) and `archived` (item has been fulfilled).
 * 
 * * `Active`: An item is Active when the Seller has published the item. Items cannot be editted by the seller while active. Additionally, Active items must have:
 *      * At least one image
 *      * Description
 *      * Name
 *      * Initial Price >= 1
 *      * Start Date
 *      * End Date
 * * `Inactive`: An item is Inactive when the Seller unpublishes the item. An item cannot be Inactive if there are active bids on the item. Inactive items can be editted by the seller. 
 * * `Frozen`: An item is Frozen when the Admin decides to freeze it. A frozen item cannot recieve new bids. A frozen item cannot be fulfilled. When time expires for a frozen item, it becomes a Failed item.
 * * `Requested`: An item is Requested when it was frozen by the Admin and the seller requests to unfreeze it.
 * * `Failed`: An item is Failed when there item is active and expires with no bids on it. An item also fail if it is frozen and time runs out.
 * * `Completed`: An item is Completed when the item is active and there is a winning bid.
 * * `Fulfilled`: An item is Fulfilled when the item is completed and the Seller fulfills the item. A Fulfilled item is always archived.
 *      * If the item frozen it cannot be fulfilled.
 * 
 * @example An example of hardcoding an ItemStatus
 * ```JS
 * const status = "Frozen" as ItemStatus;
 * // or
 * const status: ItemStatus = "Frozen";
 * ```
 */
export type ItemStatus = "Active" | "Inactive" | "Frozen" | "Requested" | "Failed" | "Completed" | "Fulfilled";

export type Item = {
    /**
     * The item id. Is unique in the database.
     */
    id: number;

    /**
     * The item's name. Max length of 45 characters.
     */
    name: string;

    /**
     * The item's description. Max length of 100 characters.
     * 
     * Can be null, but must be defined when the item is published by the {@linkcode Seller}.
     */
    description?: string;

    /**
     * The image's url. Max length of 200 characters.
     */
    image: string;

    /**
     * The item's initial price. Must be a positive whole number.
     */
    initialPrice: number;

    /**
     * The item's current price. Must be a positive whole number.
     * 
     * Defaults to {@linkcode Item.initialPrice}
     */
    price?: number;

    /**
     * The item's start date. Is required for publishing. Defaults to when the Seller publishes.
     * 
     * @example
     * ```JS
     * typeof item.startDate === "string" ? new Date(item.startDate).toLocaleDateString() : item.startDate.toLocaleDateString()
     * ```
     */
    startDate: Date | string;

    /**
     * The item's end date. Is required for publishing.
     * 
     * @example
     * ```JS
     * (typeof item.startDate === "string" ? new Date(item.startDate).toLocaleDateString() : item.startDate.toLocaleDateString()) || "No end date"
     * ```
     */
    endDate?: Date | string;

    /**
     * Whether the item has been archived. Defaults to `false`.
     */
    archived: boolean;

    /**
     * The item's status. Possible values are:
     * 
     *  * `Active`
     *  * `Inactive` 
     *  * `Frozen` 
     *  * `Requested`
     *  * `Failed` 
     *  * `Completed` 
     *  * `Fulfilled`
     * 
     * @see {@link ItemStatus} for more details on the status.
     */
    status: ItemStatus;

    /**
     * The {@link Seller.username Seller's username}.
     */
    sellerUsername: string;
};

export type Bid = {
    /**
     * The bid's ID. Is unique.
     */
    id: number;

    /**
     * The winning price of the bid. Must be a whole positive number
     */
    bid: number;

    /**
     * The time of this bid.
     */
    timeOfBid: Date;

    /**
     * The {@link Buyer.username username} of the {@link Buyer} who created the bid.
     */
    buyerUsername: string;

    /**
     * The {@link Item.id id} of the {@link Item} that this bid was placed on.
     */
    itemId: number;

    /**
     * The {@link Bid.id id} of the previous {@link Bid}.
     * 
     * Used as a way to turn {@link Bid} into a linked list.
     */
    previousBidId?: number;
};

// #endregion
// #region Accounts

/**
 * There are 3 main types of accounts: `Seller`, `Buyer`, and `Admin`. 
 * 
 * A {@link Seller} is able to sell {@link Item Items}.
 * 
 * A {@link Buyer} is able to place {@link Bid Bids}.
 * 
 * A {@link Admin} is able to freeze/unfreeze {@link Item Items}.
 */
export type AccountType = "Seller" | "Buyer" | "Admin";

/**
 * # Account
 * 
 * @see {@link Seller}, {@link Buyer}, {@link Admin}
 */
export interface Account {
    /**
     * The Account's username. Max length of 45
     */
    username: string;

    /**
     * The type of account. 
     * 
     * @see {@link AccountType}
     * 
     * Possible values: `Buyer`, `Seller`, and `Admin`.
     */
    accountType: AccountType;

    /**
     * A boolean representing if the Account is active. A non active account cannot do anything.
     * 
     * Defaults to `true`.
     */
    isActive: boolean;

    /**
     * The balance of the Account. Cannot be less than `0`.
     * 
     * Defaults to `0`.
     */
    balance: number;
};

export interface Buyer extends Account {
    bids?: Bid[];
};

export interface Seller extends Account {
    items?: Item[];
};

// An empty Account. Note that to add any features to Admin, turn it into an interface and extend Account.
export type Admin = Account;
// #endregion