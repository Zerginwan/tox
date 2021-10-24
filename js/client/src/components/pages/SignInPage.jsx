import { useHistory } from "react-router-dom";
import { useState } from "react";

import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import Logo from "../assets/logo.png";

function SignInPage(props) {
  const history = useHistory();

  const { setUserRole } = props;

  const [error, setError] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: data.get("login"),
        password: data.get("password"),
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.accessToken) {
          localStorage.setItem("accessToken", result.accessToken);
          history.push("/");
          setUserRole(result.roles[0]);
        } else {
          setError({
            show: true,
            message: result.message,
          });
        }
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img style={{ maxWidth: 200 }} src={Logo} />
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Вход
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
          {error.show ? (
            <Typography color="secondary" variant="body2">
              {error.message}
            </Typography>
          ) : null}
          <Button
            type="submit"
            fullWidth
            color="secondary"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default SignInPage;
