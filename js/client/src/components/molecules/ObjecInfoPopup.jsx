import { Popup } from "react-leaflet";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function ObjectInfoPopup(props) {
  const { object } = props;

  return (
    <Popup>
      <Box sx={{ minWidth: 240, padding: "12px" }}>
        <Typography
          variant="body1"
          sx={{ fontWeight: 900 }}
          gutterBottom
          component="div"
        >
          Тип объекта:
        </Typography>
        <Typography variant="body2" gutterBottom component="div" sx={{ mb: 2 }}>
          {object.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: 900 }}
          gutterBottom
          component="div"
        >
          Координаты объекта:
        </Typography>
        <Typography variant="body2" gutterBottom component="div">
          {object.position.lat}, {object.position.lng}
        </Typography>
      </Box>
    </Popup>
  );
}

export default ObjectInfoPopup;
