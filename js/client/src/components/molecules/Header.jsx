import { Link } from "react-router-dom";

import { styled, useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MuiAppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Toolbar from "@mui/material/Toolbar";
import ListItem from "@mui/material/ListItem";
import ListItemIconMui from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import BusinessIcon from "@mui/icons-material/Business";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CottageIcon from "@mui/icons-material/Cottage";

const ListItemIcon = styled(ListItemIconMui)(({ theme }) => ({
  color: "whitesmoke",
}));

const layersListIcons = {
  0: { icon: <AccountBalanceIcon />, title: "Административные окргуа" },
  1: { icon: <CottageIcon />, title: "Районы" },
  2: { icon: <ViewModuleIcon />, title: "Сектора" },
};

const listItemIcons = {
  1: <BusinessIcon />,
  2: <HealthAndSafetyIcon />,
  3: <SchoolIcon />,
};

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#c22",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - 300px)`,
    marginLeft: `300px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

function Header(props) {
  const {
    isOpen,
    toggleSidebar,
    selectedInfType,
    role,
    selectedLayer,
    visualProperties,
  } = props;

  return (
    <AppBar position="fixed" open={isOpen}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          Панель управления
        </Typography>
        <Grid container direction="row" sx={{ width: "250px" }}>
          {listItemIcons[selectedInfType.objectId]}
          <Typography variant="body1" component="div" sx={{ ml: 1 }}>
            {
              visualProperties.objects.find(
                (x) => x.id === selectedInfType.objectId
              ).display
            }
          </Typography>
        </Grid>
        <Grid container direction="row" sx={{ width: "250px" }}>
          {layersListIcons[selectedLayer].icon}
          <Typography variant="body1" component="div" sx={{ ml: 1 }}>
            {layersListIcons[selectedLayer].title}
          </Typography>
        </Grid>
        {role === "ROLE_ADMIN" ? (
          <IconButton>
            <Link to="/admin">
              <SupervisorAccountIcon
                sx={{
                  color: "white",
                }}
              />
            </Link>
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
