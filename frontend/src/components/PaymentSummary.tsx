"use client";

import React from "react";
import { CartItem } from "@/lib/types/cart";

interface Props {
  cart: CartItem;
  shippingCost: number;
}

export default function PaymentSummary({ cart, shippingCost }: Props) {
  const itemsTotal = cart.items.reduce(
    (acc, item) => acc + Number(item.priceAtAdd) * item.quantity,
    0
  );

  const totalDiscount = cart.items.reduce((acc, item) => {
    const productPrice = Number(item.variant?.price || 0);
    const discountPrice = Number(item.variant?.discountPrice || productPrice);
    return acc + (productPrice - discountPrice) * item.quantity;
  }, 0);

  const finalPayable = itemsTotal - totalDiscount + shippingCost;

  return (
    <div className="w-[392px] bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
      {/* عنوان */}
      <h2 className="text-lg font-bold text-gray-800">خلاصه پرداخت</h2>

      {/* ردیف‌ها */}
      <div className="flex flex-col gap-3 text-sm">

        <Row label="جمع سبد خرید" value={itemsTotal} />

        {totalDiscount > 0 && (
          <Row
            label="تخفیف"
            value={-totalDiscount}
            valueClass="text-red-500"
          />
        )}

        <Row label="هزینه ارسال" value={shippingCost} />

        <div className="border-t pt-4 mt-2" />

        {/* مبلغ نهایی */}
        <Row
          label="مبلغ قابل پرداخت"
          value={finalPayable}
          bold
          valueClass="text-blue-600"
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
  bold = false,
}: {
  label: string;
  value: number;
  valueClass?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <span className={`text-gray-600 ${bold ? "font-semibold" : ""}`}>
        {label}
      </span>

      <span
        className={`text-gray-800 ${bold ? "font-bold" : ""} ${
          valueClass || ""
        }`}
      >
        {value.toLocaleString("fa-IR")} تومان
      </span>
    </div>
  );
}
