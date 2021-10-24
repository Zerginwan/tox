import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import DrawerHeader from "../atoms/DrawerHeader";

import ToxMap from "../organisms/Map";
import Menu from "../organisms/Menu";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    width: "100%",
    height: "calc(100vh - 64px)",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 300,
    }),
  })
);

function MapPage(props) {
  const { role } = props;

  const [data, setData] = useState(null);
  const [visualProperties, setVisualProperties] = useState(null);

  const [status, setStatus] = useState({
    isLoading: false,
    isLoaded: false,
    errors: null,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(0);

  const [addObjectMode, setAddObjectMode] = useState(false);

  const history = useHistory();

  useEffect(() => {
    setStatus((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    const getData = fetch("api/getData", {
      headers: {
        "x-access-token": localStorage.getItem("accessToken"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.message === "Unauthorized!") {
          history.push("/auth/login");
        }
        setData({
          admZones: result.admZones,
          okrugs: result.okrugs,
          sectors: result.sectors,
        });
      })
      .catch((error) => {
        console.log(error);
        history.push("/auth/login");
      });

    const getVisualProperties = fetch("/api/visualProperties", {
      headers: {
        "x-access-token": localStorage.getItem("accessToken"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setVisualProperties(result);
        if (result.message === "Unauthorized!") {
          history.push("/auth/login");
        } 
      })
      .catch((error) => {
        history.push("/auth/login");
      });

    Promise.all([getData, getVisualProperties]).then(() => {
      setStatus((prevState) => ({
        ...prevState,
        isLoading: false,
        isLoaded: true,
      }));
    });
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((s) => !s);
  };

  const selectLayer = (value) => {
    setSelectedLayer(value);
  };

  const turnAddObjectMode = () => {
    setAddObjectMode(true);
  };

  const turnOffAddObjectMode = () => {
    setAddObjectMode(false);
  };

  const render = () => {
    if (status.isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (status.isLoaded) {
      return (
        <Box sx={{ display: "flex" }}>
          <Menu
            role={role}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            selectLayer={selectLayer}
            visualProperties={visualProperties}
            turnAddObjectMode={turnAddObjectMode}
          />
          <Main open={isSidebarOpen}>
            <DrawerHeader />
            <ToxMap
              selectedLayer={selectedLayer}
              data={data}
              addObjectMode={addObjectMode}
              visualProperties={visualProperties}
              turnOffAddObjectMode={turnOffAddObjectMode}
            />
          </Main>
        </Box>
      );
    }
  };

  return <div>{render()}</div>;
}

export default MapPage;
