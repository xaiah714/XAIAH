import { requireUser } from "@/lib/auth-helpers";
import { NewQuestionForm } from "./new-question-form";

export default async function NewQuestionPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold">Ask a question</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Add a photo of your work if that&apos;s easier than typing it out.
      </p>
      <div className="card mt-6">
        <NewQuestionForm />
      </div>
    </div>
  );
}
