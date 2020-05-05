const redis = require('redis');
const redisUrl = process.env.REDIS_URL;
const client = redis.createClient(redisUrl);
const { promisify } = require('util');
client.SRANDMEMBER = promisify(client.SRANDMEMBER); 
client.get = promisify(client.get); 

module.exports = { client };