export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: {
    type: "quizAmount" | "correctAnswers";
    value: number;
  };
  url: string;
}
