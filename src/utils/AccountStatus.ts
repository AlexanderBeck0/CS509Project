/**
 * # AccountStatus
 * * `Active`: Default AccountStatus. An account is Active when it is in its normal state.
 * * `Closed`: An account is Closed when it has been closed by the seller/buyer. It cannot be logged into. The username of the closed account is reserved and cannot be used again. An account cannot be closed when there are active bids/items for sale.
 * 
 * @example An example of the `/login` api for seller. It returns a token, the seller's username, status, profits, and items.
 * Note that items are not included here due to not being implemented at the time of writing this.
 * ```JS
 * const data: {token: string, username: string, status: AccountStatus, profit: number} = await response.json();
 * ```
 * @example An example of hardcoding an AccountStatus
 * ```JS
 * const status = "Closed" as AccountStatus;
 * // or
 * const status: AccountStatus = "Closed";
 * ```
 */
export type AccountStatus = "Active" | "Closed";