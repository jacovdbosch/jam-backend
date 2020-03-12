#!usr/bin/env node
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const { quizzes, quiz } = require("./database");
const { v4: uuid } = require("uuid");

const transformQuizDoc = quiz => ({ id: quiz._id, ...quiz });

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      quizzes: () => quizzes.getAllData().map(transformQuizDoc),
      getQuiz: (_, args) => {
        return new Promise(resolve => {
          quizzes.findOne({ _id: args.id }, (err, doc) => {
            if (err) throw err;

            resolve(transformQuizDoc(doc));
          });
        });
      }
    },
    Mutation: {
      createQuiz: () => {
        return new Promise(resolve => {
          const doc = {
            players: [],
            questions: []
          };

          quizzes.insert(doc, function(err, newDoc) {
            if (err) throw err;

            resolve(transformQuizDoc(newDoc));
          });
        });
      },
      joinQuiz: (_, args) => {
        return new Promise((resolve, reject) => {
          const user = {
            id: uuid(),
            name: args.name,
            score: 0,
            answers: []
          };

          quizzes.update(
            { _id: args.quizId },
            { $push: { players: user } },
            err => {
              if (err) return reject(err);

              quizzes.findOne({ _id: args.quizId }, (err, doc) => {
                if (err) return reject(err);

                return resolve(transformQuizDoc(doc));
              });
            }
          );
        });
      }
    }
  }
});

server.listen({ port: 80 }).then(v => {
  console.log(`listening on port ${v.port}`);
});
