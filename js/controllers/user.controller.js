const db = require("../models");
const User = db.user;

exports.getAllUsers = (req, res) => {
  User.findAll().then(users => {
    res.status(200).send(users.map(x => ({
      id: x.id,
      login: x.login,
      email: x.email,
      roles: x.roles,
      first_name: x.first_name,
      middle_name: x.middle_name,
    })));
  })
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};
