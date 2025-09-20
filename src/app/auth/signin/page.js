"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where your AuthForm is
    router.push("/");
  }, [router]);

  return <div>Redirecting...</div>;
}
