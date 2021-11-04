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
import StarBorder from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { styled } from "@mui/material/styles";

const ListItemIcon = styled(ListItemIconMui)(({ theme }) => ({
  color: "#c22",
}));

const listItemIcons = {
  1: <HealthAndSafetyIcon />,
  2: <SchoolIcon />,
  3: <BusinessIcon />,
};

function InfrastructureList(props) {
  const { visualProperties, selectedInfType, selectInfType } = props;

  const [open, setOpen] = useState(
    visualProperties.objectCategories.map((x) => ({
      id: x.id,
      isOpen: x.id === selectedInfType.objectCategory,
    }))
  );

  const handleClick = (id) => {
    setOpen((prevState) => {
      const newState = [...prevState];
      return newState.map((x) =>
        x.id === id ? { ...x, isOpen: !x.isOpen } : x
      );
    });
  };

  const handleObjectClick = (objectCategory, objectId) => {
    selectInfType({
      objectCategory: objectCategory,
      objectId: objectId,
    });
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
        <div key={x.id}>
          <ListItemButton
            onClick={() => {
              handleClick(x.id);
            }}
          >
            {listItemIcons[x.id] ? (
              <ListItemIcon>{listItemIcons[x.id]}</ListItemIcon>
            ) : null}
            <ListItemText primary={x.value} />
          </ListItemButton>
          <Collapse
            in={open.find((item) => item.id === x.id).isOpen}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {visualProperties.objects
                .filter((object) => object.object_category === x.id)
                .map((item, index) => (
                  <ListItemButton
                    key={index}
                    sx={{
                      pl: 4,
                    }}
                    onClick={() => {
                      handleObjectClick(item.object_category, item.id);
                    }}
                  >
                    <ListItemIcon>
                      {selectedInfType.objectId === item.id ? (
                        <StarIcon />
                      ) : (
                        <StarBorder />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={item.display} />
                  </ListItemButton>
                ))}
            </List>
          </Collapse>
        </div>
      ))}
    </List>
  );
}

export default InfrastructureList;
