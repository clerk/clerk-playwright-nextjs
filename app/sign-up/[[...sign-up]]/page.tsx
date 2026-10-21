import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Sign Up</h1>
      <Suspense>
        <SignUp path="/sign-up" routing="path" forceRedirectUrl={'/protected'} />
      </Suspense>
    </div>
  );
}
