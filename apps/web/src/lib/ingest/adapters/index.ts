/**
 * Adapter Registry
 *
 * Export all available adapters from a single entry point.
 */

export { bitrefillAdapter } from "./bitrefill";
export { dundleAdapter } from "./dundle";
export { raiseAdapter } from "./raise";
export { giftCardGrannyAdapter } from "./giftcardgranny";
export { gameflipAdapter } from "./gameflip";
export { buySellVouchersAdapter } from "./buysellvouchers";
export {
  costcoCatalogAdapter,
  egifterCatalogAdapter,
  cardcashCatalogAdapter,
  paypalCatalogAdapter,
  getAllCatalogAdapters,
} from "./catalog";
