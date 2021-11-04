const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();
const path = require("path");

const bcrypt = require("bcryptjs");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);

app.use("/static", express.static("client/build/static"));

router.get("/auth/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.use("/", router);

const db = require("./models");

db.sequelize.sync().then(() => {});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
