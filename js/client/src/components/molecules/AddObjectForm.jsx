import { useState } from "react";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

import { uid } from "uid";

function AddObjectForm(props) {
  const { addObject, selectedInfType, latLang, onClose, visualProperties } =
    props;

  const handleSubmit = () => {
    addObject({
      id: uid(),
      type: selectedInfType.objectId,
      position: latLang,
      range: visualProperties.objects.find(
        (x) => selectedInfType.objectId === x.id
      ).range,
    });
    onClose();
  };

  return (
    <Box sx={{ minWidth: "260px", padding: "12px" }}>
      <Typography variant="body2" style={{ marginBottom: "8px" }}>
        Тип объекта:
      </Typography>
      <Typography variant="body2" style={{ marginTop: "0" }}>
        {
          visualProperties.objects.find(
            (x) => x.id === selectedInfType.objectId
          )?.display
        }
      </Typography>
      <Typography variant="body2" style={{ marginBottom: "8px" }}>
        Коориданты:
      </Typography>
      <Typography variant="body2" style={{ marginTop: "0" }}>
        {latLang.lat}, {latLang.lng}
      </Typography>
      <Button variant="contained" size="small" onClick={handleSubmit}>
        Добавить
      </Button>
    </Box>
  );
}

export default AddObjectForm;
