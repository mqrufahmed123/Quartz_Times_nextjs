"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
const Context = createContext({
  desktopVisible: true,
  mobileOpen: false,
  toggleFilters: () => {},
  closeMobile: () => {},
});
export function CatalogueControls({ children }: { children: ReactNode }) {
  const [desktopVisible, setDesktopVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Context.Provider
      value={{
        desktopVisible,
        mobileOpen,
        toggleFilters: () => {
          if (window.matchMedia("(min-width: 1024px)").matches)
            setDesktopVisible((value) => !value);
          else setMobileOpen(true);
        },
        closeMobile: () => setMobileOpen(false),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useCatalogueControls = () => useContext(Context);
