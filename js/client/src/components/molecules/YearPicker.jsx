import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const marks = [
  {
    value: 2021,
    label: "2021",
  },
  {
    value: 2022,
    label: "2022",
  },
  {
    value: 2023,
    label: "2023",
  },
  {
    value: 2024,
    label: "2024",
  },
  {
    value: 2025,
    label: "2025",
  },
  {
    value: 2026,
    label: "2026",
  },
  {
    value: 2027,
    label: "2027",
  },
  {
    value: 2028,
    label: "2028",
  },
  {
    value: 2029,
    label: "2029",
  },
  {
    value: 2030,
    label: "2030",
  },
  {
    value: 2031,
    label: "2031",
  },
  {
    value: 2032,
    label: "2032",
  },
  {
    value: 2033,
    label: "2033",
  },
  {
    value: 2034,
    label: "2034",
  },
  {
    value: 2035,
    label: "2035",
  },
  {
    value: 2036,
    label: "2036",
  },
];

const styles = {
  control: {
    position: "absolute",
    top: "84px",
    width: "600px",
    zIndex: 1000,
    backgroundColor: "whitesmoke",
    padding: "24px 32px 24px 32px",
    borderRadius: 12,
  },
  controlContent: {
    marginLeft: 0,
  },
};

// className="leaflet-top leaflet-left"

const YearPicker = (props) => {
  const { year, toggleYearSelectorOpen, isSidebarOpen, selectYear } = props;
  return (
    <div
      style={{
        ...styles.control,
        left: isSidebarOpen ? "calc(50% - 150px)" : "calc(50% - 300px)",
      }}
    >
      <div
        // className="leaflet-control leaflet-bar"
        style={styles.controlContent}
      >
        <Grid container direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 2 }}>
            Прогноз населения
          </Typography>
          <IconButton onClick={toggleYearSelectorOpen}>
            <CloseIcon />
          </IconButton>
        </Grid>
        <Box sx={{ width: 600 }}>
          <Slider
            aria-label="Always visible"
            defaultValue={year}
            getAriaValueText={(value) => `${value}`}
            step={1}
            onChangeCommitted={(e, value) => {
              setTimeout(() => {
                selectYear(value);
              }, 1000);
            }}
            marks={marks}
            min={2021}
            max={2036}
          />
        </Box>
      </div>
    </div>
  );
};

export default YearPicker;
