const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(fs.readFileSync(__dirname + '/../.config.yml', 'utf-8'));

module.exports = {
  HOST: config.db.host,
  USER: config.db.username,
  PASSWORD: config.db.password,
  PORT: config.db.port,
  DB: config.db.database,
  dialect: config.db.dialect,
};