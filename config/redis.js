const redis = require('redis');
const redisUrl = process.env.REDIS_URL || 'redis://h:p33ab237b3b0f190bf3c083386886e34b67eb6bc870b6f3cd8704cefdae3fb008@ec2-52-31-65-39.eu-west-1.compute.amazonaws.com:25589';
const client = redis.createClient(redisUrl);
const { promisify } = require('util');
client.SRANDMEMBER = promisify(client.SRANDMEMBER); 
client.get = promisify(client.get);
client.SMEMBERS = promisify(client.SMEMBERS);
client.SRANDMEMBER = promisify(client.SRANDMEMBER);

module.exports = { client };