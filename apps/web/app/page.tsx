"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { LoginForm, SignUpForm } from "../components/auth-form";

export default function Home() {
  // const { data } = trpc.todo.getAllTodos.useQuery();
  const { data: session, isPending: isLoading } = authClient.useSession();
  const [activeForm, setActiveForm] = useState<"login" | "signUp">("login");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        {JSON.stringify(session)}
        <button onClick={() => authClient.signOut()}>Signout</button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setActiveForm("login")}>Sign in</button>
      <button onClick={() => setActiveForm("signUp")}>Sign up</button>

      {activeForm === "login" ? <LoginForm /> : <SignUpForm />}
    </>
  );
}
