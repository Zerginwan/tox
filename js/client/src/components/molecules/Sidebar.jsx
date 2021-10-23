import { useState } from "react";

import Divider from "@mui/material/Divider";

import DrawerHeader from "../atoms/DrawerHeader";
import MapLayersList from "../atoms/MapLayersList";
import InfrastructureList from "../atoms/infrastructureList";

function Sidebar(props) {
  const { selectLayer } = props;
  return (
    <div>
      <DrawerHeader />
      <Divider />
      <MapLayersList selectLayer={selectLayer} />
      <Divider />
      <InfrastructureList />
    </div>
  );
}

export default Sidebar;
