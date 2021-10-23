import { useState } from "react";

import DrawerHeader from "../atoms/DrawerHeader";

import ToxMap from "../organisms/Map";
import Menu from "../organisms/Menu";

import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    width: "100%",
    height: "calc(100vh - 64px)",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 300,
    }),
  })
);

function MapPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen((s) => !s);
  };

  const selectLayer = (value) => {
    setSelectedLayer(value);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Menu
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        selectLayer={selectLayer}
      />
      <Main open={isSidebarOpen}>
        <DrawerHeader />
        <ToxMap selectedLayer={selectedLayer} />
      </Main>
    </Box>
  );
}

export default MapPage;
