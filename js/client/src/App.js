import { useState } from 'react';

import AdminPage from './components/pages/AdminPage';
import MapPage from './components/pages/MapPage';
import SignInPage from './components/pages/SignInPage';
import SignUpPage from './components/pages/SignUpPage';

import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#110932",
      contrastText: "#F4FAFF"
    },
    secondary: {
      main: "#EC0E43",
      contrastText: "#F4FAFF"
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
});

function App() {
  const [role, setRole] = useState('');

  const setUserRole = (role) => {
    setRole(role)
  };

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path="/auth/login">
              <SignInPage setUserRole={setUserRole} />
            </Route>
            <Route path="/admin">
              <AdminPage />
            </Route>
            <Route path="/">
              <MapPage role={role} />
            </Route>
          </ Switch>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
