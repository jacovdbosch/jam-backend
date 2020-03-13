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
        playerAnswers: [PlayerAnswer]
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
        #        startQuestion(quizId: ID!): Boolean
        #        startQuiz(quizId: ID!): Quiz
    }

#    type Subscription {
#        quizStarted(quizId: ID!): Quiz
#        quizEnded(quizId: ID!): Quiz
#        questionHasStarted(quizId: ID!): Question
#        questionHasEnded(questionId: ID!): Question
#        playerJoinedQuiz(quizId: ID!): Player
#        playerAnsweredQuestion(questionId: ID!): Answer
#    }
`;

module.exports = typeDefs;
