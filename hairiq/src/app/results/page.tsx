import type { Metadata } from "next";
import { ResultsView } from "./results-view";

export const metadata: Metadata = {
  title: "Your Routine",
  description: "Your personalized hair-care routine with product picks at every budget.",
};

export default function ResultsPage() {
  return <ResultsView />;
}
