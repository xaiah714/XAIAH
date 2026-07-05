import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Log in</h1>
      <div className="card mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
