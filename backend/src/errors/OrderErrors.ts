export class OrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class PriceChangedError extends Error {
  constructor(
    public readonly changes: {
      itemId: number;
      name: string;
      old: number;
      new: number;
    }[],
  ) {
    super("قیمت برخی محصولات تغییر کرده است");
  }
}

export class InsufficientStockError extends OrderError {
  constructor(productName: string, available: number) {
    super(
      available === 0
        ? `محصول "${productName}" ناموجود است`
        : `موجودی "${productName}" کافی نیست (موجودی: ${available})`,
      "INSUFFICIENT_STOCK",
    );
  }
}

export class BlockedProductError extends OrderError {
  constructor(names: string[]) {
    super(`محصولات غیرفعال: ${names.join(", ")}`, "BLOCKED_PRODUCT");
  }
}

export class EmptyCartError extends OrderError {
  constructor() {
    super("سبد خرید خالی است", "EMPTY_CART");
  }
}

export class InvalidAddressError extends OrderError {
  constructor() {
    super("آدرس نامعتبر است", "INVALID_ADDRESS");
  }
}
