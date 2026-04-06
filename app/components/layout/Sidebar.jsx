import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Navigation } from "@shopify/polaris";
import { HomeIcon, ClipboardCheckFilledIcon, SettingsIcon } from "@shopify/polaris-icons";

const Sidebar = ({ store }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(path);

  const items =
    store?.isOnboarding === false
      ? [
          {
            label: "Dashboard",
            icon: HomeIcon,
            selected: isActive("/app/dashboard"),
            onClick: () => navigate("/app/dashboard"),
          },
          {
            label: "Settings",
            icon: SettingsIcon,
            selected: isActive("/app/settings"),
            onClick: () => navigate("/app/settings"),
          }
        ]
      : [
          {
            label: "Onboarding",
            icon: ClipboardCheckFilledIcon,
            selected: isActive("/app/onboarding"),
            onClick: () => navigate("/app/onboarding/welcome"),
          },
        ];

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section items={items} />
    </Navigation>
  );
};

export default Sidebar;