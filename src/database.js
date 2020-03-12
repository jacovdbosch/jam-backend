const { v4: uuid } = require("uuid");

const player = {
  id: uuid(),
  score: 12392,
  answers: []
};

const questions = {
  id: uuid(),
  label: "Vraag yo",
  answers: [
    {
      id: uuid(),
      label: "Antwoord 1 yo"
    },
    {
      id: uuid(),
      label: "Antwoord 2 yo"
    },
    {
      id: uuid(),
      label: "Antwoord 3 yo"
    },
    {
      id: uuid(),
      label: "Antwoord 4 yo"
    }
  ]
};

const quiz = {
  id: uuid(),
  questions: [questions],
  players: [player]
};

module.exports = quiz;
