export const isAtOrBelowBuffer = (stock: number, buffer: number | null | undefined): boolean =>
  typeof buffer === 'number' && buffer > 0 && stock <= buffer;
