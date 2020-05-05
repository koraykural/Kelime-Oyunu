const Pool = require('pg').Pool;
let pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://rfejkuxfgnapqc:7e58fd3e27d75c9a5c3bd801d4ec38bc5b196748f8cbcca926f71a0df5d2926d@ec2-54-217-204-34.eu-west-1.compute.amazonaws.com:5432/d9n39tt5ivnh13',
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  pool
};