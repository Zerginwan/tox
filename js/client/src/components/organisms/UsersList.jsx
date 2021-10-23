import React from "react";
import { NumberField, List, Datagrid, TextField } from "react-admin";
import { connect } from "react-redux";

export const UsersList = ({ ...props }) => (
  <List {...props}>
    <Datagrid>
      <NumberField source="id" />
      <TextField source="login" />
      <TextField source="email" />
      <TextField source="first_name" />
      <TextField source="middle_name" />
    </Datagrid>
  </List>
);

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(UsersList);
