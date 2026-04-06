import React, { useState, useCallback } from "react";
import { Frame } from "@shopify/polaris";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const AppLayout = ({ children, store }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((visible) => !visible);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  return (
    <Frame
      topBar={
        <Topbar
          onNavigationToggle={toggleSidebar}
          sidebarVisible={sidebarVisible}
          store={store}
        />
      }
      navigation={sidebarVisible ? <Sidebar store={store} /> : null}
      showMobileNavigation={sidebarVisible}
      onNavigationDismiss={closeSidebar}
    >
      {children}
    </Frame>
  );
};

export default AppLayout;
