module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER(4),
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  });

  return Role;
};