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
    Query: {
      quizzes: () => allQuizzes.then(docs => docs.map(transformQuizDoc)),
      getQuiz: (_, args) => findQuiz(args.id).then(transformQuizDoc)
    },
    Mutation: {
      createQuiz: () => createQuiz().then(transformQuizDoc),
      joinQuiz: (_, args) => {
        return findQuiz(args.quizId)
          .then(doc => {
            const user = {
              id: uuid(),
              name: args.name,
              score: 0,
              answers: []
            };

            return addPlayerToQuiz(doc._id, user).then(() => findQuiz(doc._id));
          })
          .then(transformQuizDoc);
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
      startQuiz: (_, args) => {}
    }
  }
});

server.listen({ port: 80 }).then(v => {
  console.log(`listening on port ${v.port}`);
});
