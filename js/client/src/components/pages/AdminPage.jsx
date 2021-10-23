import { Admin, Resource, EditGuesser } from "react-admin";
import fakeDataProvider from "ra-data-fakerest";

import { UsersList } from "../organisms/UsersList";

const dataProvider = fakeDataProvider({
  users: [
    {
      id: 0,
      login: "ibarkhatov",
      email: "email@email.com",
      first_name: "Igor",
      middle_name: "Barkhatov",
      role: "Admin",
    },
  ],
});

const AdminPage = () => {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="users" list={UsersList} edit={EditGuesser} />
    </Admin>
  );
};

export default AdminPage;
