#!usr/bin/env node
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const { isEmpty, remove } = require("lodash");
const {
  allQuizzes,
  findQuiz,
  createQuiz,
  addPlayerToQuiz,
  addQuestionToQuiz,
  quizzes
} = require("./quiz_repo");
const { v4: uuid } = require("uuid");

const transformQuizDoc = quiz => ({ id: quiz._id, ...quiz });

const calculateResults = questions => player => {
  const totalScore = questions.reduce((total, question) => {
    if (isEmpty(question.playerAnswers)) {
      return total;
    }

    const playerAnswers = question.playerAnswers.filter(answer => answer.playerId === player.id);

    if (isEmpty(playerAnswers)) {
      return total;
    }

    return total + playerAnswers.reduce((total, answer) => total + answer.score, 0);
  }, 0);

  return {
    player,
    totalScore
  };
};

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Quiz: {
      results: (root) => {
        if (isEmpty(root.questions) || isEmpty(root.players)) {
          return [];
        }

        const { questions, players } = root;

        return players.map(calculateResults(questions));
      }
    },
    Question: {
      results: (question, args, context) => {
        const { quiz } = context;

        if (isEmpty(quiz)) {
          return [];
        }

        const currentQuestionIndex = quiz.questions.findIndex(q => q.id === question.id);
        const questions = quiz.questions.filter((question, key) => key <= currentQuestionIndex);

        return quiz.players.map(calculateResults(questions));
      },
      everybodyAnswered: (question, args, context) => {
        if (isEmpty(question.playerAnswers)) {
          return false;
        }

        if (isEmpty(context.quiz) || isEmpty(context.quiz.players)) {
          return false;
        }

        return question.playerAnswers.length >= context.quiz.players.length;
      }
    },
    Query: {
      quizzes: () => allQuizzes().map(transformQuizDoc),
      getQuiz: (_, args, context) => {
        return findQuiz(args.id)
          .then(doc => {
            context.quiz = doc;

            return doc;
          })
          .then(transformQuizDoc);
      },
      getQuestion: (_, { quizId, questionId }, context) => {
        return findQuiz(quizId).then((doc) => {
          context.quiz = doc

          const question = doc.questions.find(question => question.id === questionId);

          return question;
        })
      }
    },
    Mutation: {
      createQuiz: () => createQuiz().then(transformQuizDoc),
      joinQuiz: (_, args) => {
        return findQuiz(args.quizId).then(doc => {
          const user = {
            id: uuid(),
            name: args.name,
            score: 0,
            answers: []
          };

          return addPlayerToQuiz(doc._id, user).then(() => user);
        });
      },
      addQuestion: (_, { quizId, label, answers }) => {
        return findQuiz(quizId)
          .then(doc => {
            const question = {
              id: uuid(),
              label: label,
              answers: answers.map(answer => ({
                id: uuid(),
                ...answer
              }))
            };

            return addQuestionToQuiz(doc._id, question).then(() =>
              findQuiz(doc._id)
            );
          })
          .then(transformQuizDoc);
      },
      deleteQuestion: (_, { quizId, questionId }) => {
        return findQuiz(quizId)
          .then(doc => {
            let questions = doc.questions;

            questions = questions.filter(question => question.id !== questionId);

            return new Promise((resolve, reject) => {
              quizzes.update({ _id: doc._id }, { $set: { questions } }, (err, updated) => {
                if (err) return reject(err);

                return resolve(findQuiz(doc._id));
              });
            });
          })
          .then(transformQuizDoc);
      },
      answerQuestion: (
        _,
        { quizId, answer: { questionId, playerId, answerId, timeToAnswerInMs } }
      ) => {
        return findQuiz(quizId).then(doc => {
          let questionIndex = doc.questions.findIndex(
            question => question.id === questionId
          );

          const maxTimeToAnswer = 10000;
          let answer = doc.questions[questionIndex].answers.find(answer => answer.id === answerId);
          let score = answer.correct ? 1000 : 0;

          if (answer.correct && timeToAnswerInMs < maxTimeToAnswer) {
            score = Math.floor((maxTimeToAnswer - timeToAnswerInMs) / maxTimeToAnswer * 1000 + score);
          }

          const playerAnswers = {
            playerId,
            answerId,
            score
          };

          const questions = doc.questions;

          if (!questions[questionIndex].playerAnswers) {
            questions[questionIndex].playerAnswers = [];
          }

          questions[questionIndex].playerAnswers.push(playerAnswers);

          return new Promise((resolve, reject) => {
            quizzes.update(
              { _id: doc._id },
              { $set: { questions: questions } },
              err => {
                if (err) return reject(err);

                return resolve(playerAnswers);
              }
            );
          });
        });
      }
    }
  }
});

server.listen({ port: 80 }).then(v => {
  console.log(`listening on port ${v.port}`);
});
