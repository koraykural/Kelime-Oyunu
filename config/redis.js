const redis = require('redis');
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const { promisify } = require('util');
client.SRANDMEMBER = promisify(client.SRANDMEMBER); 
client.get = promisify(client.get); 

module.exports = { client };