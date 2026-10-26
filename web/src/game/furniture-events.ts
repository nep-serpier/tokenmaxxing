/**
 * What the furnishing mode (`furniture.ts`) tells the hotbar. Kept in a module of its own that imports nothing, so
 * the hotbar can subscribe while the modules are still loading (`furniture.ts` and `input.ts` import each other).
 */

/** Told whenever the mode starts or ends (the hotbar redraws its selected slot). */
export const ghostListeners = new Set<() => void>();
/** Told with the item after a piece from the bag was put down for real (the hotbar keeps going with the next). */
export const placedListeners = new Set<(item: string) => void>();
