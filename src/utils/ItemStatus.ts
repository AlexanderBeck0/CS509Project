// TODO: Write an example for this
/**
 * # ItemStatus
 * * `Active`: An item is Active when the Seller has published the item.
 * * `Inactive`: An item is Inactive when the Seller unpublishes the item. An item cannot be Inactive if there are active bids on the item.
 * * `Frozen`: An item is Frozen when the Admin decides to freeze it.
 * * `Requested`: An item is Requested when it was frozen by the Admin and the seller requests to unfreeze it. A frozen seller cannot request to unfreeze an item.
 * * `Failed`: An item is Failed when there item is active and expires with no bids on it.
 * * `Completed`: An item is Completed when the item is active and there is a winning bid.
 * * `Fulfilled`: An item is Fulfilled when the item is completed and the Seller fulfills the item. A Fulfilled item is always archived.
 * 
 * @example An example of hardcoding an ItemStatus
 * ```JS
 * const status = "Frozen" as ItemStatus;
 * // or
 * const status: ItemStatus = "Frozen";
 * ```
 */
export type ItemStatus = "Active" | "Inactive" | "Frozen" | "Requested" | "Failed" | "Completed" | "Fulfilled";