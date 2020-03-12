const {ApolloServer} = require('apollo-server');
const typeDefs = require('./schema');
const quiz = require('./database');


const server = new ApolloServer({
    typeDefs, resolvers: {
        Query: {
            getQuiz: () => quiz
        }
    },
});

server.listen().then((v) => {
    console.log(`listening on port ${v.port}`);
});