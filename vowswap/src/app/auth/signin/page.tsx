"use client";

import SignInForm from "@/components/auth/SignInForm";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const showSuccessMessage = searchParams?.has('registered') ?? false;

  return (
    <>
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-400 text-green-700 rounded">
          Account created successfully! Please sign in.
        </div>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
