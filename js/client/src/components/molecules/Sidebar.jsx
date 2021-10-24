import { useState } from "react";

import Divider from "@mui/material/Divider";

import DrawerHeader from "../atoms/DrawerHeader";
import MapLayersList from "../atoms/MapLayersList";
import InfrastructureList from "../atoms/InfrastructureList";

function Sidebar(props) {
  const { selectLayer, visualProperties } = props;
  return (
    <div>
      <DrawerHeader />
      <Divider />
      <MapLayersList selectLayer={selectLayer} />
      <Divider />
      <InfrastructureList visualProperties={visualProperties} />
    </div>
  );
}

export default Sidebar;
