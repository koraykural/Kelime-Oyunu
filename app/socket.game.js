// Redis client
const { client } = require('../config/redis');
const { getRandomPack } = require('./data');

const startGame = async roomID => {
  const questions = await getRandomPack();
  let parsedQuestions = [];
  questions.forEach(el => {
    parsedQuestions.push(JSON.parse(el));
  });
  return { starting: { questions: parsedQuestions } };
}

const answerQuestion = (id, msg) => {
  const { roomID, questionNumber, score } = msg;
  return { answer: { id, questionNumber, score } };
}

module.exports = { startGame, answerQuestion };