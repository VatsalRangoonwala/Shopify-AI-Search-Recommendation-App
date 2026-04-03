import React, { useState, useCallback } from "react";
import { TopBar, ActionList, Icon } from "@shopify/polaris";
import { StoreIcon } from "@shopify/polaris-icons";

const Topbar = ({ onNavigationToggle }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = useCallback(
    () => setUserMenuOpen((open) => !open),
    []
  );

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [
            { content: "Account Settings" },
            { content: "Help Center" },
            { content: "Log out" },
          ],
        },
      ]}
      name="Store Admin"
      detail="my-store.myshopify.com"
      initials="SA"
      open={userMenuOpen}
      onToggle={toggleUserMenu}
    />
  );

  return (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={onNavigationToggle}
    />
  );
};

export default Topbar;
