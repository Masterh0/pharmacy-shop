export function calcShippingFee(province: string | null, city: string | null): number {
  if (city?.trim() === "اهواز" || province?.trim() === "خوزستان" && city?.trim() === "اهواز") {
    return 100_000;
  }
  return 200_000;
}
