import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Navigation } from "@shopify/polaris";
import { HomeIcon, ClipboardCheckFilledIcon } from "@shopify/polaris-icons";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            icon: HomeIcon,
            selected: isActive("/app/dashboard"),
            onClick: () => navigate("/app/dashboard"),
          },
          {
            label: "Onboarding",
            icon: ClipboardCheckFilledIcon,
            selected: isActive("/app/onboarding"),
            onClick: () => navigate("/app/onboarding/welcome"),
          },
        ]}
      />
    </Navigation>
  );
};

export default Sidebar;
