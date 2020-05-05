/*
* This file fetches all of the questions
* from database and stores them on redis
* This file also provides functions
* to serve questions (single question or pack of questions etc.)
*/

// Redis client
const { client } = require('../config/redis');
// Database
const { pool } = require('../config/db');

// init function gets all the words from database
// and caches them in redis sets
const init = async () => {

  // Create 7 arrays. Each array will be a redis set
  // First index of each array will be the key of that set
  let words = [[],[],[],[],[],[],[],[]];
  for (let i = 0; i < 7; i++) {
    words[i][0] = 'letters_' + ( i+4 );
  }

  // Database rows, all words
  const rows = (await pool.query('SELECT * FROM words')).rows;

  rows.forEach(row => {
    // words[index]
    const index = row.letter_count - 4;

    // Remove unnecesary properties
    delete row.id; delete row.letter_count;

    words[index].push(JSON.stringify(row));
  });

  // Create redis sets
  for (let i = 0; i < 7; i++) {
    client.SADD(words[i]);
  }
}

// Gives one random word
const getRandomOne = () => {
  const letter_count = Math.floor(Math.random() * 7) + 4;
  return client.SRANDMEMBER('letters_' + letter_count);
}

// Gives a pack of 14 word
const getRandomPack = () => {
  let promises = [];
  for (let i = 4; i < 11; i++) {
    promises.push(client.SRANDMEMBER('letters_' + i));
    promises.push(client.SRANDMEMBER('letters_' + i));
  }
  return Promise.all(promises);
}

module.exports = { init, getRandomOne, getRandomPack };