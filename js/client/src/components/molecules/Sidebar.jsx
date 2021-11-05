import { useState } from "react";

import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CreateIcon from "@mui/icons-material/Create";
import DrawerHeader from "../atoms/DrawerHeader";
import MapLayersList from "../atoms/MapLayersList";
import InfrastructureList from "../atoms/InfrastructureList";

function Sidebar(props) {
  const {
    selectLayer,
    selectInfType,
    visualProperties,
    objectMode,
    turnOnObjectMode,
    turnOffObjectMode,
    addObjectMode,
    selectedInfType,
    turnAddObjectMode,
    turnOffAddObjectMode,
    isYearSelectorOpen,
    toggleYearSelectorOpen,
  } = props;

  const toggleObjectMode = () => {
    if (objectMode) {
      turnOffObjectMode();
      turnOffAddObjectMode();
    } else {
      turnOnObjectMode();
    }
  };

  const toggleAddOjectMode = () => {
    if (addObjectMode) {
      turnOffAddObjectMode();
    } else {
      turnAddObjectMode();
    }
  };
  return (
    <div>
      <DrawerHeader />
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Прогноз населения
          </ListSubheader>
        }
      >
        <ListItem>
          <FormControlLabel
            label="Показать прогноз"
            control={
              <Switch
                checked={isYearSelectorOpen}
                onChange={toggleYearSelectorOpen}
              />
            }
          />
        </ListItem>
      </List>
      <Divider />
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Управление объектами
          </ListSubheader>
        }
      >
        <ListItem>
          <FormControlLabel
            label="Отображать объекты"
            control={
              <Switch checked={objectMode} onChange={toggleObjectMode} />
            }
          />
        </ListItem>
        <ListItemButton onClick={toggleAddOjectMode}>
          <ListItemIcon sx={{ minWidth: 33 }}>
            {addObjectMode ? (
              <CreateIcon color="primary" />
            ) : (
              <AddIcon color="primary" />
            )}
          </ListItemIcon>
          <ListItemText primary={"Добавить объект"} />
        </ListItemButton>
      </List>
      <Divider />
      <MapLayersList
        selectedInfType={selectedInfType}
        selectLayer={selectLayer}
      />
      <Divider />
      <InfrastructureList
        visualProperties={visualProperties}
        selectedInfType={selectedInfType}
        selectInfType={selectInfType}
      />
      <Divider />
    </div>
  );
}

export default Sidebar;
