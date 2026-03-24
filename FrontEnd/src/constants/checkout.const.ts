/**
 * Session storage key used to temporarily persist the current checkout `orderCode`
 * before redirecting the user to the external PayOS payment page.
 *
 * This allows the app to recover the pending order after the user returns to the site
 * in the same browser tab, so the success page can verify payment status and decide
 * whether it is safe to clear the cart.
 */
export const CHECKOUT_PENDING_ORDER_CODE_KEY = "checkout-pending-order-code";

/**
 * Session storage key for persisting pending checkout context
 * between staff create and staff confirm pages.
 */
export const STAFF_CHECKOUT_PENDING_CONTEXT_KEY = "staff-checkout-pending-context";

/**
 * Session storage key for the latest staff payment attempt metadata.
 */
export const STAFF_CHECKOUT_LAST_RESULT_KEY = "staff-checkout-last-result";
