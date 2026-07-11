import type { Metadata } from "next";
import { QuizFlow } from "./quiz-flow";

export const metadata: Metadata = {
  title: "Hair Quiz",
  description: "10 quick questions to build your personalized hair-care routine.",
};

export default function QuizPage() {
  return <QuizFlow />;
}
