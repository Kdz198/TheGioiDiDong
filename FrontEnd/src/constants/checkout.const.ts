/**
 * Session storage key used to temporarily persist the current checkout `orderCode`
 * before redirecting the user to the external PayOS payment page.
 *
 * This allows the app to recover the pending order after the user returns to the site
 * in the same browser tab, so the success page can verify payment status and decide
 * whether it is safe to clear the cart.
 */
export const CHECKOUT_PENDING_ORDER_CODE_KEY = "checkout-pending-order-code";
