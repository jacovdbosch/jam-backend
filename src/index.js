#!usr/bin/env node
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
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

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Quiz: {
      results: (root) => {
        if (root.questions === undefined) {
          return [];
        }

        return root.players.map(player => {
          const totalScore = root.questions.reduce((total, question) => {
            return total + question.playerAnswers.filter(answer => answer.playerId === player.id).reduce((total, answer) => total + answer.score, 0);
          }, 0);

          return {
            player,
            totalScore
          };
        });
      }
    },
    Query: {
      quizzes: () => allQuizzes().map(transformQuizDoc),
      getQuiz: (_, args) => findQuiz(args.id).then(transformQuizDoc)
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
      addQuestion: (_, args) => {
        return findQuiz(args.quizId)
          .then(doc => {
            const question = {
              id: uuid(),
              label: args.label,
              answers: args.answers.map(answer => ({
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
      startQuiz: (_, args) => {
      },
      answerQuestion: (
        _,
        { quizId, answer: { questionId, playerId, answerId } }
      ) => {
        return findQuiz(quizId).then(doc => {
          let questionIndex = doc.questions.findIndex(
            question => question.id === questionId
          );

          const playerAnswers = {
            playerId,
            answerId
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
