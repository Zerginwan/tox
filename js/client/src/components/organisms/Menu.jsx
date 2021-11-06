// React imports
import { useState } from "react";

// Components import
import Header from "../molecules/Header";
import Sidebar from "../molecules/Sidebar";

// MUI imports
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

function Menu(props) {
  const {
    role,
    isOpen,
    toggleSidebar,
    selectLayer,
    selectedLayer,
    selectedInfType,
    selectInfType,
    visualProperties,
    objectMode,
    turnOnObjectMode,
    turnOffObjectMode,
    addObjectMode,
    turnOffAddObjectMode,
    turnAddObjectMode,
    isYearSelectorOpen,
    toggleYearSelectorOpen,
  } = props;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header
        role={role}
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        selectedInfType={selectedInfType}
        selectedLayer={selectedLayer}
        visualProperties={visualProperties}
      />
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
          selectInfType={selectInfType}
          selectedInfType={selectedInfType}
          visualProperties={visualProperties}
          addObjectMode={addObjectMode}
          turnAddObjectMode={turnAddObjectMode}
          turnOffAddObjectMode={turnOffAddObjectMode}
          objectMode={objectMode}
          turnOnObjectMode={turnOnObjectMode}
          turnOffObjectMode={turnOffObjectMode}
          isYearSelectorOpen={isYearSelectorOpen}
          toggleYearSelectorOpen={toggleYearSelectorOpen}
        />
      </Drawer>
    </Box>
  );
}

export default Menu;
