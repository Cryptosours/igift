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
// Phase 4.2 — new live source adapters
export { cdkeysAdapter } from "./cdkeys";
export { enebaAdapter } from "./eneba";
export { offgamersAdapter } from "./offgamers";
export { g2aAdapter } from "./g2a";
export { kinguinAdapter } from "./kinguin";
export {
  costcoCatalogAdapter,
  egifterCatalogAdapter,
  cardcashCatalogAdapter,
  paypalCatalogAdapter,
  bestbuyCatalogAdapter,
  targetCatalogAdapter,
  neweggCatalogAdapter,
  walmartCatalogAdapter,
  gamestopCatalogAdapter,
  getAllCatalogAdapters,
} from "./catalog";
