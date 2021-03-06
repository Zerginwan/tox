const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isManagerOrAdmin],
    controller.getAllUsers
  );

  app.get("/api/sectors", [authJwt.verifyToken], controller.getSectors);

  app.get("/api/getData", [authJwt.verifyToken], controller.getData);

  app.get(
    "/api/visualProperties",
    [authJwt.verifyToken],
    controller.getVisualProperties
  );

  app.post("/api/addObject", [authJwt.verifyToken], controller.addObject);
};
