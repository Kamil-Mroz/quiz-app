export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  timeToSolve: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timesSolved: number;
}

export interface Question {
  id: number;
  text: string;
  correctAnswer: string | number | boolean | Date;
  type: 'text' | 'numeric' | 'boolean' | 'date';
  choices?: { choiceText: string | number | boolean | Date }[];
}

export interface User {
  username: string;
  password: string;
  email: string;
  token: string;
  solvedQuizzes?: SolvedQuiz[];
}

export interface SolvedQuiz {
  quizId: number;
  accuracy: number;
}
