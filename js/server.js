const express = require('express');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

const app = express();

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require('./models');
const Role = db.role;

db.sequelize.sync();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
})

// function initial() {
//   Role.create({
//     id: 1,
//     name: "user"
//   });

//   Role.create({
//     id: 2,
//     name: "manager"
//   });

//   Role.create({
//     id: 3,
//     name: "admin"
//   });
// }