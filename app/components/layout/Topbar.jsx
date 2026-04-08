import React, { useState, useCallback } from "react";
import { TopBar, Icon } from "@shopify/polaris";
import { MenuIcon } from "@shopify/polaris-icons";

const Topbar = ({ onNavigationToggle, sidebarVisible, store }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = useCallback(
    () => setUserMenuOpen((open) => !open),
    [],
  );

  // Generate initials from store name
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationButtonMarkup = (
    <button
      type="button"
      onClick={onNavigationToggle}
      aria-label={sidebarVisible ? "Close sidebar" : "Open sidebar"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.5rem",
        height: "2.5rem",
        border: "none",
        borderRadius: "0.75rem",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      <Icon source={MenuIcon} tone="base" />
    </button>
  );

  const getShopName = (shop) => {
    if (!shop) return "";
    return shop.replace(".myshopify.com", "");
  };

  const userMenuMarkup = (
    <TopBar.UserMenu
      name={store?.name || getShopName(store?.shop) || "Store"}
      detail={store?.shop}
      initials={getInitials(store?.name || getShopName(store?.shop))}
      open={userMenuOpen}
      onToggle={toggleUserMenu}
    />
  );

  return (
    <TopBar contextControl={navigationButtonMarkup} userMenu={userMenuMarkup} />
  );
};

export default Topbar;

