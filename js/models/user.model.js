module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER(4),
      primaryKey: true
    },
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
    role: {
      type: Sequelize.INTEGER(4)
    },
    password: {
      type: Sequelize.STRING
    }
  });

  return User;
};
