const db = require("../models");
const pool = require("../db/quieries");
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

exports.getSectors = (req, res) => {
  pool.query('SELECT * FROM sectors', (error, results) => {
    if (error) {
      res.status(500).json('Ошибка получения данных');
    }
    res.status(200).json(results.rows);
  })
}

exports.getVisualProperties = (req, res) => {
  (async () => {
    try {
      const objectCategories = await pool.query('SELECT * FROM object_categories')
      const objects = await pool.query('SELECT * FROM objects');

      res.status(200).json({
        objectCategories: objectCategories.rows,
        objects: objects.rows
      });
    } catch (e) {
      res.status(500).json('Ошибка получения данных');
    }
  })();
}