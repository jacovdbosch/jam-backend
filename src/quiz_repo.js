const { quizzes } = require("./database");

const allQuizzes = () => quizzes.getAllData();

const findQuiz = quizId => {
  return new Promise((resolve, reject) => {
    return quizzes.findOne({ _id: quizId }, (err, doc) => {
      if (err) return reject(err);

      return resolve(doc);
    });
  });
};

const createQuiz = () => {
  return new Promise((resolve, reject) => {
    const doc = {
      players: [],
      questions: []
    };

    quizzes.insert(doc, function(err, newDoc) {
      if (err) return reject(err);

      return resolve(newDoc);
    });
  });
};

const addPlayerToQuiz = (quizId, user) => {
  return new Promise((resolve, reject) => {
    quizzes.update({ _id: quizId }, { $push: { players: user } }, err => {
      if (err) return reject(err);

      return resolve();
    });
  });
};

module.exports = {
  allQuizzes,
  findQuiz,
  createQuiz,
  addPlayerToQuiz
};
