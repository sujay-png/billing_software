"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/controllers/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { error: "" };

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);
  const signup = mode === "signup";

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-neutral-950 p-12 text-white lg:flex">
        <div>
          <p className="text-xs tracking-[0.22em] text-neutral-400 uppercase">Accounting software</p>
          <h1 className="mt-8 max-w-md text-4xl leading-tight font-semibold">Invoices, estimates, and customers in one quiet ledger.</h1>
        </div>
        <p className="max-w-sm text-sm text-neutral-400">
          Sign up with the email from your previous account and the existing books open automatically.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-16">
        <form action={formAction} className="w-full max-w-sm space-y-5">
          <div>
            <p className="text-xs tracking-[0.18em] text-neutral-500 uppercase lg:hidden">Accounting software</p>
            <h2 className="mt-2 text-2xl font-semibold">{signup ? "Create your workspace" : "Sign in"}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {signup ? "A matching email reconnects the imported business." : "Use the email and password for this workspace."}
            </p>
          </div>
          {signup ? (
            <>
              <Field label="Your name" name="name" autoComplete="name" />
              <Field label="Business name" name="business" placeholder="Used only for a new business" />
            </>
          ) : null}
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} required />
          {state.error ? <p className="text-sm text-neutral-950">{state.error}</p> : null}
          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending ? "Please wait" : signup ? "Create account" : "Sign in"}
          </Button>
          <p className="text-sm text-neutral-500">
            {signup ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-neutral-950 underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/signup" className="font-medium text-neutral-950 underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} className="h-10" {...props} />
    </div>
  );
}
