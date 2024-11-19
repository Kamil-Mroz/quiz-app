export interface User {
  username: string
  password: string
  email: string
  solvedQuizzes?: SolvedQuiz[],
  achievements:string[],
  correctAnswers:number
}

export interface SolvedQuiz {
  quizId: number
  accuracy: number
}
