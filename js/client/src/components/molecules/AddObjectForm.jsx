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
  const { addObject, latLang, onClose } = props;

  const [objectType, setObjectType] = useState("");
  const [objectName, setObjectName] = useState("");

  const handleChangeType = (event) => {
    setObjectType(event.target.value);
  };

  const handleChangeName = (event) => {
    setObjectName(event.target.value);
  };

  const handleSubmit = () => {
    addObject({
      type: objectType,
      name: objectName,
      position: latLang,
    });
    onClose();
  };

  return (
    <Box sx={{ minWidth: "260px", padding: "20px" }}>
      <FormControl variant="standard" fullWidth>
        <InputLabel id="object-type-label">Тип объекта</InputLabel>
        <Select
          labelId="object-type-label"
          id="object-type"
          value={objectType}
          label="Тип объекта"
          size="small"
          onChange={handleChangeType}
        >
          <MenuItem value={"Больница"}>Больница</MenuItem>
          <MenuItem value={"Школа"}>Школа</MenuItem>
          <MenuItem value={"МФЦ"}>МФЦ</MenuItem>
        </Select>
      </FormControl>
      <FormControl
        variant="standard"
        fullWidth
        required
        sx={{ marginTop: "20px", marginBottom: "20px" }}
      >
        <TextField
          id="object-name"
          label="Название объекта"
          variant="standard"
          size="small"
          onChange={handleChangeName}
        />
      </FormControl>
      <div style={{ marginBottom: "30px" }}>
        <b>Коориданты:</b>
        <br />
        {latLang.lat}, {latLang.lng}
      </div>
      <Button
        variant="contained"
        size="small"
        disabled={!objectType || !objectName}
        onClick={handleSubmit}
      >
        Сохранить
      </Button>
    </Box>
  );
}

export default AddObjectForm;
