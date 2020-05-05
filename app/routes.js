/*
* Most routes are managed by frontend
* Rest is here
*/
const express = require('express');
const bodyParser = require('body-parser');
const dataService = require('./data');

const router = express.Router();

const getRandomOne = (req, res) => {
  dataService.getRandomOne()
    .then(wordObj => wordObj ? res.json(wordObj) : res.status(400).json({error: "Could not get a word object"}))
    .catch(err => res.status(400).json({ error: err }))
}

const getRandomPack = (req, res) => {
  dataService.getRandomPack()
    .then(list => list ? res.json(list) : res.status(400).json({error: "Could not get a word list"}))
    .catch(err => res.status(400).json({ error: err }))
}

router.get('/one', getRandomOne);
router.get('/pack', getRandomPack);
router.get('/', (req, res) => { res.sendFile('index.html') });

module.exports = router;