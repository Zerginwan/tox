import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const headerCells = ["ID", "Логин", "E-mail", "Имя", "Фамилия"];

function UsersTable(props) {
  const { users } = props;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {headerCells.map((item, index) => (
              <TableCell key={index} align="left" sx={{ fontWeight: 600 }}>
                {item}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="left">{user.id}</TableCell>
              <TableCell align="left">{user.login}</TableCell>
              <TableCell align="left">{user.email}</TableCell>
              <TableCell align="left">{user.first_name}</TableCell>
              <TableCell align="left">{user.middle_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UsersTable;
