import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SignUpForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
