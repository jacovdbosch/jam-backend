const { v4: uuid } = require("uuid");
const { join } = require("path");
const DataStore = require("nedb");

const quizzes = new DataStore({
  filename: join(__dirname, "/../database/quizzes"),
  autoload: true
});

module.exports = {
  quizzes
};
