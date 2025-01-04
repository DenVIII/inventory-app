const { Pool } = require("pg");
require("dotenv").config();

module.exports = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
});
