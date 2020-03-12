#!usr/bin/env node
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const {
  allQuizzes,
  findQuiz,
  createQuiz,
  addPlayerToQuiz
} = require("./quiz_repo");
const { v4: uuid } = require("uuid");

const transformQuizDoc = quiz => ({ id: quiz._id, ...quiz });

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

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      quizzes: () => allQuizzes.then(docs => docs.map(transformQuizDoc)),
      getQuiz: (_, args) => quiz
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
      startQuiz: (_, args) => {}
    }
  }
});

server.listen({ port: 80 }).then(v => {
  console.log(`listening on port ${v.port}`);
});
