"use client";

import { useState } from "react";
import CartPreview from "./CartPreview";

export default function CartWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="relative">🛒</button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50">
          <CartPreview />
        </div>
      )}
    </div>
  );
}
