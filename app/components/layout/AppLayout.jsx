import React, { useState, useCallback } from "react";
import { Frame } from "@shopify/polaris";
import Sidebar from "./Sidebar.jsx";
// import Topbar from "./Topbar.jsx";

const AppLayout = ({ children }) => {
  const [mobileNavActive, setMobileNavActive] = useState(false);

  const toggleMobileNav = useCallback(
    () => setMobileNavActive((active) => !active),
    []
  );

  return (
    <Frame
      // topBar={<Topbar onNavigationToggle={toggleMobileNav} />}
      navigation={<Sidebar />}
      showMobileNavigation={mobileNavActive}
      onNavigationDismiss={toggleMobileNav}
    >
       {children}
    </Frame>
  );
};

export default AppLayout;
