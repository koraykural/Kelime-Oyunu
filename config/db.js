const Pool = require('pg').Pool;
let pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  pool
};