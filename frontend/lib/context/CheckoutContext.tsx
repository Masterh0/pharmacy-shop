// lib/context/CheckoutContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CheckoutContextType {
  addressId: number | null;
  setAddressId: (id: number | null) => void;
  hydrated: boolean;
}

const CheckoutContext = createContext<CheckoutContextType>({
  addressId: null,
  setAddressId: () => {},
  hydrated: false,
});

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [addressId, setAddressIdState] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("checkout-address-id");

    if (saved) {
      const parsedId = Number(saved);

      if (Number.isFinite(parsedId) && parsedId > 0) {
        setAddressIdState(parsedId);
      } else {
        sessionStorage.removeItem("checkout-address-id");
      }
    }

    setHydrated(true);
  }, []);

  const setAddressId = (id: number | null) => {
    setAddressIdState(id);

    if (id === null) {
      sessionStorage.removeItem("checkout-address-id");
      return;
    }

    sessionStorage.setItem("checkout-address-id", String(id));
  };

  return (
    <CheckoutContext.Provider
      value={{
        addressId,
        setAddressId,
        hydrated,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);
