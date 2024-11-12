export interface User {
  username: string
  password: string
  email: string
  solvedQuizzes?: SolvedQuiz[]
}

export interface SolvedQuiz {
  quizId: number
  accuracy: number
}
