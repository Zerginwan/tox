import { useState } from "react";

import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";

import DrawerHeader from "../atoms/DrawerHeader";
import MapLayersList from "../atoms/MapLayersList";
import InfrastructureList from "../atoms/InfrastructureList";

function Sidebar(props) {
  const { selectLayer, visualProperties, turnAddObjectMode } = props;
  return (
    <div>
      <DrawerHeader />
      <Divider />
      <MapLayersList selectLayer={selectLayer} />
      <Divider />
      <InfrastructureList visualProperties={visualProperties} />
      <Divider />
      <Button
        color="primary"
        variant="contained"
        sx={{ mt: 2, ml: 2 }}
        onClick={turnAddObjectMode}
      >
        Добавить объект
      </Button>
    </div>
  );
}

export default Sidebar;
