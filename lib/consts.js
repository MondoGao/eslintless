const path = require('path');

const ERR_LEVEL = 1;
const BOUNDARY_TIP = 'Above line was added by eslintless';
const MODE = {
  CREATE: 1,
  DELETE: 2,
};
const BASE_DIR = process.env.PWD;
const UPDATE_LOG_PATH = path.resolve(BASE_DIR, '.eslint_update.log.json');

module.exports = {
  ERR_LEVEL,
  BOUNDARY_TIP,
  MODE,
  BASE_DIR,
  UPDATE_LOG_PATH,
};
