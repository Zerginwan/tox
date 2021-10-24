import { useState } from "react";

import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIconMui from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CottageIcon from "@mui/icons-material/Cottage";
import { styled } from "@mui/material/styles";

const ListItemIcon = styled(ListItemIconMui)(({ theme }) => ({
  color: "#c22",
}));

function MapLayersList(props) {
  const [open, setOpen] = useState(true);
  const { selectLayer } = props;

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Выбор слоя
        </ListSubheader>
      }
    >
      <ListItemButton onClick={() => selectLayer(0)}>
        <ListItemIcon>
          <AccountBalanceIcon />
        </ListItemIcon>
        <ListItemText primary="Административные округа" />
      </ListItemButton>
      <ListItemButton onClick={() => selectLayer(1)}>
        <ListItemIcon>
          <CottageIcon />
        </ListItemIcon>
        <ListItemText primary="Районы" />
      </ListItemButton>
      <ListItemButton onClick={() => selectLayer(2)}>
        <ListItemIcon>
          <ViewModuleIcon />
        </ListItemIcon>
        <ListItemText primary="Сектора" />
      </ListItemButton>
    </List>
  );
}

export default MapLayersList;
