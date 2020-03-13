const { gql } = require("apollo-server");

const typeDefs = gql`
    type Player {
        id: ID!
        score: Int!
        name: String!
        answers: [Answer]!
    }

    input AnswerInput {
        label: String!
    }

    type Answer {
        id: ID!
        label: String!
    }

    input PlayerAnswerInput {
        questionId: ID!
        answerId: ID!
        playerId: ID!
    }

    type PlayerAnswer {
        answerId: ID!
        playerId: ID!
    }

    type Question {
        id: ID!
        label: String!
        answers: [Answer]!
        playerAnswers: [PlayerAnswer]
    }

    type Quiz {
        id: ID!
        players: [Player]!
        questions: [Question]!
    }

    type Query {
        quizzes: [Quiz]
        getQuiz(id: ID!): Quiz
        getQuestion(quizId: ID!, questionId: ID!): Question!
    }

    type Mutation {
        createQuiz: Quiz
        startQuiz(quizId: ID!): Quiz
        joinQuiz(quizId: ID!, name: String): Player
        addQuestion(quizId: ID!, label: String!, answers: [AnswerInput]!): Quiz
        startQuestion(quizId: ID!): Boolean
        answerQuestion(quizId: ID!, answer: PlayerAnswerInput): PlayerAnswer
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

module.exports = typeDefs;
