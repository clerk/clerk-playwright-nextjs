import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Sign In</h1>
      <Suspense>
        <SignIn path="/sign-in" routing="path" />
      </Suspense>
    </div>
  );
}
