import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import DrawerHeader from "../atoms/DrawerHeader";

import YearPicker from "../molecules/YearPicker";

import ToxMap from "../organisms/Map";
import Menu from "../organisms/Menu";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
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
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);

  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [selectedInfType, setSelectedInfType] = useState({
    objectCategory: 1,
    objectId: 2,
  });
  const [addObjectMode, setAddObjectMode] = useState(false);
  const [objectMode, setObjectMode] = useState(true);

  const history = useHistory();

  useEffect(() => {
    setStatus((prevState) => ({
      ...prevState,
      isLoaded: false,
      isLoading: true,
    }));

    const getData = fetch(
      `api/getData?objectType=${selectedInfType.objectId}&year=${selectedYear}`,
      {
        headers: {
          "x-access-token": localStorage.getItem("accessToken"),
        },
      }
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.message === "Unauthorized!") {
          history.push("/auth/login");
        }
        setData({
          admZones: result.admZones,
          okrugs: result.okrugs,
          sectors: result.sectors,
          objects: result.objects,
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
  }, [selectedYear, selectedInfType.objectId]);

  const addObject = (objectData) => {};

  const toggleSidebar = () => {
    setIsSidebarOpen((s) => !s);
  };

  const selectLayer = (value) => {
    setSelectedLayer(value);
  };

  const selectInfType = (newState) => {
    setSelectedInfType(newState);
  };

  const turnAddObjectMode = () => {
    setAddObjectMode(true);
    setObjectMode(true);
  };

  const turnOffAddObjectMode = () => {
    setAddObjectMode(false);
  };

  const turnOnObjectMode = () => {
    setObjectMode(true);
  };

  const turnOffObjectMode = () => {
    setObjectMode(false);
  };

  const selectYear = (value) => {
    setSelectedYear(value);
  };

  const toggleYearSelectorOpen = () => {
    setIsYearSelectorOpen((s) => !s);
  };

  const changeData = (newData) => {
    const newOkrugs = newData.okrugs ? JSON.parse(newData.okrugs) : [];
    const newAdmZones = newData.adm_zones ? JSON.parse(newData.adm_zones) : [];
    const newSectors = newData.sectors ? JSON.parse(newData.sectors) : [];

    console.log(newSectors);

    setData((prevState) => {
      const newState = { ...prevState };

      newOkrugs.map((x) =>
        newState.okrugs.splice(
          newState.okrugs.findIndex(
            (item) => item.okrug_okato == x.okrug_okato
          ),
          1,
          x
        )
      );
      newAdmZones.map((x) =>
        newState.admZones.splice(
          newState.admZones.findIndex((item) => item.adm_okato == x.adm_okato),
          1,
          x
        )
      );

      newSectors.map((x) =>
        newState.sectors.splice(
          newState.sectors.findIndex((item) => item.cell_zid == x.cell_zid),
          1,
          x
        )
      );

      console.log(newState.sectors);

      return newState;
    });
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
            selectedLayer={selectedLayer}
            selectedInfType={selectedInfType}
            selectInfType={selectInfType}
            visualProperties={visualProperties}
            addObjectMode={addObjectMode}
            turnAddObjectMode={turnAddObjectMode}
            turnOffAddObjectMode={turnOffAddObjectMode}
            objectMode={objectMode}
            turnOnObjectMode={turnOnObjectMode}
            turnOffObjectMode={turnOffObjectMode}
            isYearSelectorOpen={isYearSelectorOpen}
            toggleYearSelectorOpen={toggleYearSelectorOpen}
          />
          <Main open={isSidebarOpen}>
            <DrawerHeader />
            {isYearSelectorOpen ? (
              <YearPicker
                year={selectedYear}
                isSidebarOpen={isSidebarOpen}
                selectYear={selectYear}
                toggleYearSelectorOpen={toggleYearSelectorOpen}
              />
            ) : null}
            <ToxMap
              selectedInfType={selectedInfType}
              selectedLayer={selectedLayer}
              selectedYear={selectedYear}
              data={data}
              changeData={changeData}
              selectLayer={selectLayer}
              addObjectMode={addObjectMode}
              objectMode={objectMode}
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
