import { Link } from "react-router-dom";

import { styled, useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

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
  const { isOpen, toggleSidebar, role } = props;

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
          Меню
        </Typography>
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
