const fetch = require("node-fetch-commonjs");
const yaml = require('js-yaml');
const db = require("../models");
const pool = require("../db/quieries");
const fs = require('fs');
const config = yaml.load(fs.readFileSync(__dirname + '/../.config.yml', 'utf-8'));
const User = db.user;

exports.getAllUsers = (req, res) => {
  User.findAll().then((users) => {
    res.status(200).send(
      users.map((x) => ({
        id: x.id,
        login: x.login,
        email: x.email,
        roles: x.roles,
        first_name: x.first_name,
        middle_name: x.middle_name,
      }))
    );
  });
};

exports.getSectors = (req, res) => {
  pool.query("SELECT * FROM sectors", (error, results) => {
    if (error) {
      res.status(500).json("Ошибка получения данных");
    }
    res.status(200).json(results.rows);
  });
};

exports.getVisualProperties = (req, res) => {
  (async () => {
    try {
      const objectCategories = await pool.query(
        "SELECT * FROM object_categories"
      );
      const objects = await pool.query("SELECT * FROM objects");
      const affinityIndexes = await pool.query(
        "SELECT * FROM affinity_indexes"
      );

      res.status(200).json({
        objectCategories: objectCategories.rows,
        objects: objects.rows,
        affinityIndexes: affinityIndexes.rows,
      });
    } catch (e) {
      res.status(500).json("Ошибка получения данных");
    }
  })();
};

exports.getData = (req, res) => {
  (async () => {
    try {
      const year = req.query.year;
      const objectType = req.query.objectType;

      let sectors = { rows: null };
      const admZones = await pool.query(
        `SELECT * FROM preset_${objectType}_${year}_adm_zones`
      );
      const okrugs = await pool.query(
        `SELECT * FROM preset_${objectType}_${year}_okrugs`
      );

      if (Number(objectType) !== 1) {
        sectors =
          objectType === 1
            ? { rows: null }
            : await pool.query(
                `SELECT * FROM preset_${objectType}_${year}_sectors`
              );
      }

      const mfc = await pool.query("SELECT * FROM mfc");
      const polyclinic_child = await pool.query(
        "SELECT * FROM polyclinic_child"
      );

      res.status(200).json({
        admZones: admZones.rows,
        okrugs: okrugs.rows,
        sectors: sectors.rows,
        objects: {
          mfc: mfc.rows,
          polyclinic_child: polyclinic_child.rows,
        },
      });
    } catch (e) {
      res.status(500).json("Ошибка получения данных");
    }
  })();
};

exports.addObject = (req, res) => {
  fetch(config.flask.schema + "://" + config.flask.host +"/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      object_type_id: req.body.objectTypeId,
      year: req.body.year,
      additional_objects: [
        {
          lat: req.body.lat,
          lon: req.body.lon,
        },
      ],
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((e) => {
      res.status(500).json("Ошибка при добавлении объекта");
    });
};
