import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function SignUpPopup(props) {
  const { isOpen, handleClose } = props;

  const [role, setRole] = useState("user");

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: data.get("login"),
        password: data.get("password"),
        email: data.get("email"),
        first_name: data.get("first_name"),
        middle_name: data.get("middle_name"),
        roles: [role],
      }),
    });
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={style}>
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Создать пользователя
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate={false}
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="login"
            label="Логин"
            name="login"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <TextField
            margin="normal"
            fullWidth
            name="email"
            label="E-mail"
            type="email"
            id="email"
          />
          <TextField
            margin="normal"
            fullWidth
            name="first_name"
            label="Имя"
            id="first_name"
          />
          <TextField
            margin="normal"
            fullWidth
            name="middle_name"
            label="Фамилия"
            id="middle_name"
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-label">Роль</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              label="Роль"
              value={role}
              onChange={handleRoleChange}
            >
              <MenuItem value={"user"}>Пользователь</MenuItem>
              <MenuItem value={"admin"}>Администратор</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            color="primary"
            variant="contained"
            sx={{ mt: 3, mb: 2, fontWeight: 600 }}
          >
            Создать
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default SignUpPopup;
