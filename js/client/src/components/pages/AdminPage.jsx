import { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import UsersTable from "../organisms/UsersTable";
import SignUpPopup from "../organisms/SignUpPopup";

function AdminPage() {
  const [status, setStatus] = useState({
    isLoading: false,
    isLoaded: false,
    error: null,
  });

  const [users, setUsers] = useState([]);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    setStatus((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetch("/api/getAllUsers", {
      headers: {
        "x-access-token": localStorage.getItem("accessToken"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setUsers(result);
        setStatus((prevState) => ({
          ...prevState,
          isLoading: false,
          isLoaded: true,
        }));
      })
      .catch((e) => {
        setStatus((prevState) => ({
          ...prevState,
          error: e,
        }));
      });
  }, []);

  const handleOpen = () => {
    setIsSignUpOpen(true);
  };

  const handleClose = () => {
    setIsSignUpOpen(false);
  };

  const renderTable = () => {
    return status.isLoaded ? (
      <UsersTable users={users} />
    ) : (
      <CircularProgress />
    );
  };
  return (
    <Container component="main" maxWidth="md" sx={{ mt: 10 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        Список пользователей
      </Typography>
      {renderTable()}
      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 4 }}
        onClick={handleOpen}
      >
        Cоздать пользователя
      </Button>
      <SignUpPopup isOpen={isSignUpOpen} handleClose={handleClose}/>
    </Container>
  );
}

export default AdminPage;
