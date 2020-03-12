const { gql } = require('apollo-server');

const typeDefs = gql`    
    type Player {
        score: Int!
        answers: [Answer]!
    }
    
    type Answer {
        id: ID!
        value: String!
    }
    
    type Question {
        id: ID!
        value: String!
        label: String!
    }
    
    type Quiz {
        id: ID!
        players: [Player]!,
        questions: [Question]!,
    }
    
    type Query {
        getQuiz(id: ID!): Quiz
    }
    
    type Mutation {
        startQuiz(quizId: ID!): Quiz
        joinQuiz(quizId: ID!, name: String): Quiz
        startQuestion(quizId: ID!): Boolean
        answerQuestion(quizId: ID!, questionId: ID!, answer: String!): Answer
    }
    
    type Subscription {
        quizStarted(quizId: ID!): Quiz
        quizEnded(quizId: ID!): Quiz
        questionHasStarted(quizId: ID!): Question
        questionHasEnded(questionId: ID!): Question
        playerJoinedQuiz(quizId: ID!): Player
        playerAnsweredQuestion(questionId: ID!): Answer
    }
`;