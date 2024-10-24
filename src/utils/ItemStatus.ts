// TODO: Write an in-code example for this
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