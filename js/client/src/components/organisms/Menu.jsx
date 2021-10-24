// React imports
import { useState } from "react";

// Components import
import Header from "../molecules/Header";
import Sidebar from "../molecules/Sidebar";

// MUI imports
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

function Menu(props) {
  const { isOpen, toggleSidebar, selectLayer, visualProperties } = props;
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <Drawer
        sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={isOpen}
      >
        <Sidebar
          selectLayer={selectLayer}
          visualProperties={visualProperties}
        />
      </Drawer>
    </Box>
  );
}

export default Menu;
