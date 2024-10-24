/**
 * # AccountStatus
 * * `Active`: Default AccountStatus. An account is Active when it is in its normal state.
 * * `Frozen`: An account is Frozen when the Admin decides to freeze it. While frozen, the buyer/seller can only login to their account where they can request to be unfrozen.
 * * `Requested`: An account is Requested when it was Frozen by the Admin and the seller/buyer requested for it to be unfrozen.
 * * `Closed`: An account is Closed when it has been closed by the seller/buyer. It cannot be logged into. The username of the closed account is reserved and cannot be used again. An account cannot be closed when there are active bids/items for sale.
 * 
 * @example An example of the `/login` api for seller. It returns a token, the seller's username, status, profits, and items.
 * Note that items are not included here due to not being implemented at the time of writing this.
 * ```JS
 * const data: {token: string, username: string, status: AccountStatus, profit: number} = await response.json();
 * ```
 * @example An example of hardcoding an AccountStatus
 * ```JS
 * const status = "Frozen" as AccountStatus;
 * // or
 * const status: AccountStatus = "Frozen";
 * ```
 */
export type AccountStatus = "Active" | "Frozen" | "Requested" | "Closed";