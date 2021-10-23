module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    login: {
      type: Sequelize.STRING(64)
    },
    email: {
      type: Sequelize.STRING(128)
    },
    first_name: {
      type: Sequelize.STRING(64)
    },
    middle_name: {
      type: Sequelize.STRING(64)
    },
    password: {
      type: Sequelize.STRING
    }
  });

  return User;
};
