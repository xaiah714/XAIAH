import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Takes under a minute. You can start asking questions right away.
      </p>
      <div className="card mt-6">
        <SignupForm />
      </div>
    </div>
  );
}
