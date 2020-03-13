const { gql } = require("apollo-server");

const typeDefs = gql`
    type Player {
        id: ID!
        name: String!
    }

    input AnswerInput {
        label: String!
        correct: Boolean!
    }

    type Answer {
        id: ID!
        label: String!
        correct: Boolean!
    }
    
    input PlayerAnswerInput {
        questionId: ID!
        answerId: ID!
        playerId: ID!
        # The time in milliseconds to answer the question.
        timeToAnswerInMs: Int!
    }

    type PlayerAnswer {
        answerId: ID!
        playerId: ID!
        score: Int
    }

    type Question {
        id: ID!
        label: String!
        answers: [Answer]!
        playerAnswers: [PlayerAnswer],
        results: [Results]
        everybodyAnswered: Boolean!
    }
    
    type Results {
        player: Player,
        totalScore: Int
    }

    type Quiz {
        id: ID!
        players: [Player]!
        questions: [Question]!
        results: [Results]
    }

    type Query {
        quizzes: [Quiz]
        getQuiz(id: ID!): Quiz
    }

    type Mutation {
        createQuiz: Quiz
        joinQuiz(quizId: ID!, name: String!): Player
        addQuestion(quizId: ID!, label: String!, answers: [AnswerInput]!): Quiz
        answerQuestion(quizId: ID!, answer: PlayerAnswerInput): PlayerAnswer
        deleteQuestion(quizId: ID!, questionId: ID!): Quiz
    }
`;

module.exports = typeDefs;
