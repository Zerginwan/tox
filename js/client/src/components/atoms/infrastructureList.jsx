import { useState } from "react";

import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIconMui from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import BusinessIcon from "@mui/icons-material/Business";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";
import { styled } from "@mui/material/styles";

const ListItemIcon = styled(ListItemIconMui)(({ theme }) => ({
  color: theme.palette.secondary.main,
}));

const listItemIcons = {
  1: <HealthAndSafetyIcon />,
  2: <SchoolIcon />,
  3: <BusinessIcon />,
};

function InfrastructureList(props) {
  const { visualProperties } = props;

  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Тип инфраструктуры
        </ListSubheader>
      }
    >
      {visualProperties.objectCategories.map((x) => (
        <ListItemButton key={x.id}>
          <ListItemIcon>{listItemIcons[x.id]}</ListItemIcon>
          <ListItemText primary={x.value} />
        </ListItemButton>
      ))}
    </List>
  );
}

export default InfrastructureList;
