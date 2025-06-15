// BEKLENEN DOSYA YOLU: components/providers/sidebar-provider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Context tipini tanımla
type SidebarContextType = {
  isCollapsed: boolean;
  isCollapsible: boolean;
  toggleSidebar: () => void;
  setCollapsible: (value: boolean) => void;
};

// createContext ile context'i oluştur
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// useSidebar hook'unu oluştur ve export et
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// Provider bileşenini oluştur ve export et
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isCollapsible, setCollapsible] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isCollapsible,
        toggleSidebar,
        setCollapsible,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
