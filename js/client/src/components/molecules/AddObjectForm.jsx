import { useState } from "react";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

function AddObjectForm(props) {
  const {
    addObject,
    selectedInfType,
    latLang,
    onClose,
    visualProperties,
  } = props;

  const [objectType, setObjectType] = useState(0);
  const [radius, setRadius] = useState(0);

  const handleChangeType = (event) => {
    setObjectType(event.target.value);
  };

  const handleSubmit = () => {
    addObject({
      type: objectType,
      position: latLang,
      name: visualProperties.objects.find((x) => objectType === x.id).display,
      range: visualProperties.objects.find((x) => objectType === x.id).range,
    });
    onClose();
  };

  return (
    <Box sx={{ minWidth: "260px", padding: "20px" }}>
      <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
        <InputLabel id="object-type-label">Тип объекта</InputLabel>
        <Select
          labelId="object-type-label"
          id="object-type"
          value={objectType}
          label="Тип объекта"
          size="small"
          onChange={handleChangeType}
        >
          {visualProperties.objects
            .filter(
              (item) => item.object_category === selectedInfType.objectCategory
            )
            .map((x) => (
              <MenuItem key={x.id} value={x.id}>
                {x.display}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <div style={{ marginBottom: "30px" }}>
        <b>Коориданты:</b>
        <br />
        {latLang.lat}, {latLang.lng}
      </div>
      <Button
        variant="contained"
        size="small"
        disabled={!objectType}
        onClick={handleSubmit}
      >
        Сохранить
      </Button>
    </Box>
  );
}

export default AddObjectForm;
