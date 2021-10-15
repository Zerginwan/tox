const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(fs.readFileSync(__dirname + '/../.config.yml', 'utf-8'));

module.exports = {
  secret: config.auth.secret
};