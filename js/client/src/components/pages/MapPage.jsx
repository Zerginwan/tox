import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import DrawerHeader from "../atoms/DrawerHeader";

import ToxMap from "../organisms/Map";
import Menu from "../organisms/Menu";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

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

  const history = useHistory();

  useEffect(() => {
    fetch("/api/test/user", {
      headers: {
        "x-access-token": localStorage.getItem("accessToken"),
      },
    }).catch((error) => {
      console.log(error);
      history.push("/auth/login");
    });
  }, []);

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
