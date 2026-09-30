export interface PriceChangeItem {
  itemId: number;
  old: number;
  new: number;
}

export class PriceChangedError extends Error {
  public changes: PriceChangeItem[];

  constructor(changes: PriceChangeItem[]) {
    super("قیمت برخی از محصولات تغییر کرده است.");
    this.name = "PriceChangedError";
    this.changes = changes;
  }
}
